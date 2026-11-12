"""Command line entry point.  Run `python -m shorts_factory --help`."""
from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

from .models import Project, VideoScript, word_count

PROJECTS = Path("projects")


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "video"


def write_review(project: Project, topic: str, script: VideoScript) -> None:
    words = word_count(script)
    lines = [f"# {script.title}", "", f"Topic: {topic}  ", f"Words: {words} (~{words / 2.6:.0f}s spoken)", ""]
    if script.uncertain_claims:
        lines += ["## ⚠ Check these claims first", ""] + [f"- {c}" for c in script.uncertain_claims] + [""]
    lines += ["## Narration", ""]
    for i, s in enumerate(script.segments, 1):
        lines += [f"{i}. {s.narration}  ", f"   _footage: {s.visual_query}_", ""]
    lines += ["## Sources (open them!)", ""] + [f"- {s.claim} — {s.url}" for s in script.sources]
    lines += ["", "---", f"Edit script.json to change anything, then: `python -m shorts_factory approve {project.root.name}`"]
    project.review_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def cmd_new(args) -> None:
    import anthropic

    from .script_gen import research, write_script

    topics = [args.topic] if args.topic else [
        l.strip() for l in Path(args.file).read_text(encoding="utf-8").splitlines() if l.strip()
    ]
    for topic in topics:
        project = Project(PROJECTS / slugify(topic))
        if project.script_path.exists() and not args.overwrite:
            print(f"skip (exists): {project.root}")
            continue
        print(f"→ {topic}\n  researching ...")
        try:
            notes = research(topic, effort=args.effort)
        except (anthropic.APIError, RuntimeError) as e:
            print(f"  ✗ {type(e).__name__}: {e}")
            continue
        project.root.mkdir(parents=True, exist_ok=True)
        (project.root / "topic.txt").write_text(topic, encoding="utf-8")
        (project.root / "research.md").write_text(notes, encoding="utf-8")
        print("  writing script ...")
        try:
            script = write_script(topic, notes, seconds=args.seconds, effort=args.effort)
        except (anthropic.APIError, RuntimeError) as e:
            print(f"  ✗ {type(e).__name__}: {e}  (research notes kept in research.md)")
            continue
        project.save(script)
        write_review(project, topic, script)
        flag = f"  ⚠ {len(script.uncertain_claims)} uncertain claim(s)" if script.uncertain_claims else ""
        print(f"  done: {project.review_path}{flag}")


def cmd_ideas(args) -> None:
    from .script_gen import ideas

    done = [p.name for p in PROJECTS.iterdir()] if PROJECTS.exists() else []
    topics = ideas(args.niche, args.n, avoid=done)
    print("\n".join(topics))
    if args.out:
        Path(args.out).write_text("\n".join(topics) + "\n", encoding="utf-8")
        print(f"\nsaved to {args.out} → next: python -m shorts_factory new --file {args.out}")


def _projects(names: list[str], all_flag: bool) -> list[Project]:
    if all_flag:
        return [Project(p) for p in sorted(PROJECTS.iterdir()) if (p / "script.json").exists()]
    return [Project(PROJECTS / n.rstrip("/\\").split("/")[-1].split("\\")[-1]) for n in names]


def cmd_approve(args) -> None:
    for p in _projects(args.names, False):
        script = p.load()  # validates the JSON you edited
        topic_file = p.root / "topic.txt"
        topic = topic_file.read_text(encoding="utf-8").strip() if topic_file.exists() else p.root.name
        write_review(p, topic, script)
        p.approve()
        print(f"approved: {p.root.name}")


def cmd_render(args) -> None:
    from .ffmpeg import require_ffmpeg
    from .render import render

    require_ffmpeg()
    projects = _projects(args.names, args.all_approved)
    if args.all_approved:
        projects = [p for p in projects if p.is_approved() and not (p.out_dir / f"{p.root.name}.mp4").exists()]
    if not projects:
        print("nothing to render")
    failed = 0
    for p in projects:
        print(f"→ rendering {p.root.name}")
        try:
            out = render(p, tts_provider=args.tts, voice=args.voice,
                         music=Path(args.music) if args.music else None, font=args.font, force=args.force)
            print(f"  ✓ {out}")
        except (RuntimeError, OSError) as e:
            failed += 1
            print(f"  ✗ {e}")
    if failed:
        sys.exit(1)


def cmd_status(args) -> None:
    if not PROJECTS.exists():
        print("no projects yet")
        return
    for p in sorted(PROJECTS.iterdir()):
        pr = Project(p)
        if not pr.script_path.exists():
            continue
        state = "rendered" if (pr.out_dir / f"{p.name}.mp4").exists() else "approved" if pr.is_approved() else "needs review"
        print(f"{state:13} {p.name}")


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(prog="shorts_factory", description="Researched short-form fact videos.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("ideas", help="suggest topics for a niche")
    a.add_argument("niche")
    a.add_argument("-n", type=int, default=10)
    a.add_argument("--out", help="save topics to a text file")
    a.set_defaults(fn=cmd_ideas)

    a = sub.add_parser("new", help="research a topic and write a script for review")
    g = a.add_mutually_exclusive_group(required=True)
    g.add_argument("topic", nargs="?")
    g.add_argument("--file", help="text file with one topic per line")
    a.add_argument("--seconds", type=int, default=45)
    a.add_argument("--effort", default="medium", choices=["low", "medium", "high", "xhigh", "max"])
    a.add_argument("--overwrite", action="store_true")
    a.set_defaults(fn=cmd_new)

    a = sub.add_parser("approve", help="mark reviewed scripts as ready to render")
    a.add_argument("names", nargs="+")
    a.set_defaults(fn=cmd_approve)

    a = sub.add_parser("render", help="render approved projects to MP4")
    a.add_argument("names", nargs="*")
    a.add_argument("--all-approved", action="store_true", help="render every approved, not-yet-rendered project")
    a.add_argument("--tts", default="edge", choices=["edge", "elevenlabs", "silent"])
    a.add_argument("--voice", help="edge voice name or ElevenLabs voice ID")
    a.add_argument("--music", help="background music file (must be licensed for your use)")
    a.add_argument("--font", default="Arial Black")
    a.add_argument("--force", action="store_true", help="render without approval (testing only)")
    a.set_defaults(fn=cmd_render)

    a = sub.add_parser("status", help="list projects and their state")
    a.set_defaults(fn=cmd_status)

    args = ap.parse_args(argv)
    if args.cmd == "render" and not args.names and not args.all_approved:
        ap.error("render: give project names or --all-approved")
    args.fn(args)


if __name__ == "__main__":
    main()
