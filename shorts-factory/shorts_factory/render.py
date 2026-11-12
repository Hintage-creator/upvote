"""Approved script -> final 1080x1920 MP4 + upload notes."""
from __future__ import annotations

import shutil
from pathlib import Path

from .captions import write_ass
from .ffmpeg import ffprobe_duration, run
from .models import Project
from .tts import synthesize
from .visuals import IMAGE_EXT, gradient_spec, own_media, pexels_clip

FPS = 30
SCALE_CROP = f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps={FPS}"
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p"]
GAP = 0.12  # seconds of silence between segments


def _segment_video(src: Path | None, gradient_index: int, duration: float, out: Path) -> str:
    """Render one background clip of exactly `duration` seconds. Returns a label for the log."""
    d = f"{duration:.3f}"
    if src is None:
        run(["ffmpeg", "-y", "-f", "lavfi", "-i", gradient_spec(gradient_index), "-t", d,
             "-vf", f"fps={FPS}", *ENC, "-an", str(out)])
        return "gradient"
    if src.suffix.lower() in IMAGE_EXT:
        frames = int(duration * FPS) + 1
        # slow Ken Burns zoom; upscale first so zoompan does not look jittery
        vf = (f"scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,"
              f"zoompan=z='min(zoom+0.0007,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
              f":d={frames}:s=1080x1920:fps={FPS},setsar=1")
        run(["ffmpeg", "-y", "-loop", "1", "-i", str(src), "-t", d, "-vf", vf, *ENC, "-an", str(out)])
        return f"image {src.name}"
    run(["ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src), "-t", d, "-vf", SCALE_CROP, *ENC, "-an", str(out)])
    return f"video {src.name}"


def render(project: Project, tts_provider: str = "edge", voice: str | None = None,
           music: Path | None = None, music_volume: float = 0.10, font: str = "Arial Black",
           force: bool = False) -> Path:
    script = project.load()
    if not project.is_approved() and not force:
        raise SystemExit(
            f"{project.root.name}: not approved (or changed after approval).\n"
            f"Read {project.review_path.name}, fix script.json if needed, then run: approve {project.root.name}"
        )

    work = project.work_dir
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    project.out_dir.mkdir(parents=True, exist_ok=True)
    cache = project.root.parent / ".cache"

    all_words: list[tuple[str, float, float]] = []
    audio_parts: list[Path] = []
    video_parts: list[Path] = []
    used_pexels: set[int] = set()
    t = 0.0

    for i, seg in enumerate(script.segments, start=1):
        print(f"  [{i}/{len(script.segments)}] voice ...", end="", flush=True)
        wav, words = synthesize(seg.narration, work / f"voice_{i:02d}", tts_provider, voice)
        dur = ffprobe_duration(wav) + GAP
        padded = work / f"voice_{i:02d}_pad.wav"
        run(["ffmpeg", "-y", "-i", str(wav), "-af", f"apad=pad_dur={GAP}", "-ar", "48000", "-ac", "1", str(padded)])
        audio_parts.append(padded)
        all_words += [(w, s + t, e + t) for (w, s, e) in words]

        src = own_media(project.media_dir, i) or pexels_clip(seg.visual_query, cache, dur, used_pexels)
        seg_mp4 = work / f"bg_{i:02d}.mp4"
        label = _segment_video(src, i, dur, seg_mp4)
        video_parts.append(seg_mp4)
        print(f" {dur:.1f}s, background: {label}")
        t += dur

    # concat audio + video (all parts share codec settings, so stream copy is safe)
    (work / "audio.txt").write_text("".join(f"file '{p.name}'\n" for p in audio_parts), encoding="utf-8")
    (work / "video.txt").write_text("".join(f"file '{p.name}'\n" for p in video_parts), encoding="utf-8")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "audio.txt", "-c", "copy", "voice.wav"], cwd=work)
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "video.txt", "-c", "copy", "bg.mp4"], cwd=work)

    write_ass(all_words, work / "captions.ass", font=font)

    # Final mix. Run inside work/ and use relative paths: the ass filter is
    # notoriously bad with Windows drive letters (C:\...).
    out = project.out_dir / f"{project.root.name}.mp4"
    cmd = ["ffmpeg", "-y", "-i", "bg.mp4", "-i", "voice.wav"]
    if music:
        cmd += ["-stream_loop", "-1", "-i", str(music.resolve())]
        fc = (f"[0:v]ass=captions.ass[v];"
              f"[2:a]volume={music_volume}[m];[1:a][m]amix=inputs=2:duration=first:normalize=0,"
              f"loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    else:
        fc = "[0:v]ass=captions.ass[v];[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]"
    cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", *ENC,
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
            str(out.resolve())]
    run(cmd, cwd=work)

    _write_upload_notes(project, script, ffprobe_duration(out))
    return out


def _write_upload_notes(project: Project, script, duration: float) -> None:
    tags = " ".join("#" + h.lstrip("#").replace(" ", "") for h in script.hashtags)
    sources = "\n".join(f"- {s.url}" for s in dict((s.url, s) for s in script.sources).values())
    text = f"""TITLE
{script.title}

DESCRIPTION
{script.description}

Sources:
{sources}

{tags}

---
Length: {duration:.1f}s
Checklist before posting:
- [ ] Watched the whole video once (captions in sync, no weird footage)
- [ ] AI label: TikTok and YouTube require labels for realistic AI-generated content.
      Check each platform's current rule for AI voice + stock footage and set the toggle accordingly.
"""
    (project.out_dir / "upload.txt").write_text(text, encoding="utf-8")
