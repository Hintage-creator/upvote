"""Topic -> researched, sourced script, using Claude with web search.

Two calls:
  1. research: Claude searches the web and writes notes with source URLs.
  2. script:   Claude turns those notes into a VideoScript (structured output).
Splitting them keeps the script grounded in what was actually found,
and lets the structured-output call stay simple.
"""
from __future__ import annotations

import anthropic

from .models import VideoScript

MODEL = "claude-opus-5-5"
# On a safety-classifier decline, the API re-runs the request on a fallback model
# inside the same call. Harmless for normal requests; see README.
FALLBACK_BETA = "server-side-fallback-2026-07-01"

RESEARCH_SYSTEM = """You research facts for short educational videos (YouTube Shorts / TikTok).
Use web search to find 5-8 surprising but TRUE facts about the topic.
For every fact, give the exact source URL you found it on.
Prefer primary or reputable sources (scientific institutions, encyclopedias, major news, official sites).
Explicitly mark facts that are disputed, outdated, or only found on low-quality sites.
Do not include popular "facts" that are actually myths, unless you label them as myths."""

SCRIPT_SYSTEM = """You write scripts for vertical short-form fact videos, read aloud by a text-to-speech voice.

Rules:
- Use ONLY facts from the research notes. Never add facts from memory.
- Total narration {min_words}-{max_words} words (about {seconds} seconds spoken).
- 5-8 segments. Segment 1 is the hook: a surprising concrete claim or question in under 15 words. No "Did you know", no "In this video".
- Plain spoken English. Short sentences. No emojis, no hashtags, no stage directions in the narration.
- Write numbers the way they should be spoken where it matters ("three hundred million", not "300M").
- End with a short punchline or callback, not "like and subscribe".
- visual_query: concrete, filmable stock-footage terms (Pexels search). Avoid abstract terms like "history" or "science".
- sources: one entry per factual claim, URL copied from the notes.
- uncertain_claims: list anything the notes marked as disputed or weakly sourced that you still used. Prefer not using such claims at all.
- title: honest, curiosity-driven, max ~70 characters."""


def _client() -> anthropic.Anthropic:
    return anthropic.Anthropic()  # reads ANTHROPIC_API_KEY (or an `ant auth login` profile)


def _check_stop(msg, step: str) -> None:
    if msg.stop_reason == "refusal":
        raise RuntimeError(f"{step}: Claude declined this topic ({getattr(msg, 'stop_details', None)}).")
    if msg.stop_reason == "max_tokens":
        raise RuntimeError(f"{step}: response hit max_tokens and was cut off.")


def research(topic: str, effort: str = "medium") -> str:
    client = _client()
    messages: list = [{"role": "user", "content": f"Topic: {topic}"}]
    tools = [{"type": "web_search_20260209", "name": "web_search", "max_uses": 6}]
    for _ in range(4):  # resume server-tool turns that pause
        msg = client.beta.messages.create(
            model=MODEL,
            max_tokens=16000,
            system=RESEARCH_SYSTEM,
            messages=messages,
            tools=tools,
            output_config={"effort": effort},
            betas=[FALLBACK_BETA],
            fallbacks="default",
        )
        if msg.stop_reason != "pause_turn":
            break
        messages.append({"role": "assistant", "content": msg.content})
    _check_stop(msg, "research")

    notes = "\n".join(b.text for b in msg.content if b.type == "text").strip()
    # Also keep the raw URLs the search returned, so the script step can cite them.
    urls: list[str] = []
    for b in msg.content:
        if b.type == "web_search_tool_result" and isinstance(b.content, list):
            urls += [r.url for r in b.content if getattr(r, "url", None)]
    if urls:
        notes += "\n\nURLs returned by search:\n" + "\n".join(dict.fromkeys(urls))
    if not notes:
        raise RuntimeError("research: no notes returned")
    return notes


def write_script(topic: str, notes: str, seconds: int = 45, effort: str = "medium") -> VideoScript:
    words_per_sec = 2.6
    system = SCRIPT_SYSTEM.format(
        min_words=int(seconds * words_per_sec * 0.85),
        max_words=int(seconds * words_per_sec * 1.05),
        seconds=seconds,
    )
    client = _client()
    msg = client.beta.messages.parse(
        model=MODEL,
        max_tokens=16000,
        system=system,
        messages=[{"role": "user", "content": f"Topic: {topic}\n\n<research_notes>\n{notes}\n</research_notes>"}],
        output_format=VideoScript,
        output_config={"effort": effort},
        betas=[FALLBACK_BETA],
        fallbacks="default",
    )
    _check_stop(msg, "script")
    if msg.parsed_output is None:
        raise RuntimeError("script: no structured output returned")
    return msg.parsed_output


IDEAS_SYSTEM = """You suggest topics for short educational fact videos (YouTube Shorts / TikTok).
Each topic must be specific enough for a 45-second video with 5-8 verifiable facts
(e.g. "Why octopuses have three hearts", not "Animals").
Avoid topics that depend on breaking news, medical advice, or contested politics.
Return one topic per line, nothing else."""


def ideas(niche: str, n: int = 10, avoid: list[str] | None = None) -> list[str]:
    avoid_txt = ""
    if avoid:
        avoid_txt = "\n\nAlready done, do not repeat or closely paraphrase:\n" + "\n".join(avoid)
    msg = _client().beta.messages.create(
        model=MODEL,
        max_tokens=4000,
        system=IDEAS_SYSTEM,
        messages=[{"role": "user", "content": f"Niche: {niche}\nNumber of topics: {n}{avoid_txt}"}],
        output_config={"effort": "low"},
        betas=[FALLBACK_BETA],
        fallbacks="default",
    )
    _check_stop(msg, "ideas")
    text = "\n".join(b.text for b in msg.content if b.type == "text")
    lines = [l.strip().lstrip("-*0123456789. ").strip() for l in text.splitlines()]
    return [l for l in lines if l][:n]
