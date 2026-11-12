"""Text-to-speech with word timestamps (needed for word-by-word captions).

Providers:
  edge        free Microsoft Edge voices via the edge-tts package (unofficial API,
              can break or be rate-limited without notice). Default.
  elevenlabs  paid, best quality. Needs ELEVENLABS_API_KEY.
  silent      no voice, silent audio with estimated timings. Only for testing the render.

Every provider returns (audio_file, words) where words = [(text, start_s, end_s), ...].
"""
from __future__ import annotations

import asyncio
import base64
import os
from pathlib import Path

from .ffmpeg import ffprobe_duration, run

Word = tuple[str, float, float]


def synthesize(text: str, out_base: Path, provider: str, voice: str | None) -> tuple[Path, list[Word]]:
    if provider == "edge":
        return _edge(text, out_base, voice or "en-US-AndrewMultilingualNeural")
    if provider == "elevenlabs":
        return _elevenlabs(text, out_base, voice)
    if provider == "silent":
        return _silent(text, out_base)
    raise ValueError(f"unknown TTS provider: {provider}")


def _to_wav(src: Path, dst: Path) -> Path:
    run(["ffmpeg", "-y", "-i", str(src), "-ar", "48000", "-ac", "1", str(dst)])
    return dst


def estimate_timings(text: str, duration: float) -> list[Word]:
    """Spread words over the duration proportionally to their length (fallback)."""
    words = text.split()
    weights = [len(w) + 2 for w in words]
    total = sum(weights) or 1
    t, out = 0.0, []
    for w, k in zip(words, weights):
        d = duration * k / total
        out.append((w, t, t + d))
        t += d
    return out


def _edge(text: str, out_base: Path, voice: str) -> tuple[Path, list[Word]]:
    import edge_tts

    mp3 = out_base.with_suffix(".mp3")
    words: list[Word] = []

    async def go():
        comm = edge_tts.Communicate(text, voice, boundary="WordBoundary")
        with open(mp3, "wb") as f:
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    start = chunk["offset"] / 1e7  # 100-ns ticks
                    words.append((chunk["text"], start, start + chunk["duration"] / 1e7))

    asyncio.run(go())
    wav = _to_wav(mp3, out_base.with_suffix(".wav"))
    if not words:
        words = estimate_timings(text, ffprobe_duration(wav))
    else:
        words = _reattach_punctuation(text, words)
    return wav, words


def _reattach_punctuation(text: str, words: list[Word]) -> list[Word]:
    """Edge word boundaries drop punctuation. Map back onto the original tokens
    when the counts line up, so captions show 'hearts.' instead of 'hearts'."""
    tokens = text.split()
    if len(tokens) != len(words):
        return words
    return [(tok, s, e) for tok, (_, s, e) in zip(tokens, words)]


def _elevenlabs(text: str, out_base: Path, voice: str | None) -> tuple[Path, list[Word]]:
    import requests

    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise RuntimeError("ELEVENLABS_API_KEY is not set")
    voice_id = voice or os.environ.get("ELEVENLABS_VOICE_ID")
    if not voice_id:
        raise RuntimeError("Set --voice or ELEVENLABS_VOICE_ID to an ElevenLabs voice ID")
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps",
        headers={"xi-api-key": key},
        json={"text": text, "model_id": os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")},
        timeout=120,
    )
    r.raise_for_status()
    data = r.json()
    mp3 = out_base.with_suffix(".mp3")
    mp3.write_bytes(base64.b64decode(data["audio_base64"]))
    wav = _to_wav(mp3, out_base.with_suffix(".wav"))

    al = data.get("alignment") or {}
    chars = al.get("characters") or []
    starts = al.get("character_start_times_seconds") or []
    ends = al.get("character_end_times_seconds") or []
    words: list[Word] = []
    cur, cs, ce = "", None, None
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append((cur, cs, ce))
            cur, cs = "", None
            continue
        if cs is None:
            cs = s
        cur += ch
        ce = e
    if cur:
        words.append((cur, cs, ce))
    if not words:
        words = estimate_timings(text, ffprobe_duration(wav))
    return wav, words


def _silent(text: str, out_base: Path) -> tuple[Path, list[Word]]:
    duration = max(1.0, len(text.split()) / 2.6)
    wav = out_base.with_suffix(".wav")
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", f"{duration:.2f}", str(wav)])
    return wav, estimate_timings(text, duration)
