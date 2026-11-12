"""Background footage per segment.

Order of preference for segment i (1-based):
  1. your own file in projects/<name>/media/ named i.mp4/.mov/.jpg/.png  (always wins)
  2. a portrait stock clip from Pexels (needs PEXELS_API_KEY, free)
  3. an animated colour gradient (always works, looks generic)
"""
from __future__ import annotations

import os
import random
from pathlib import Path

VIDEO_EXT = (".mp4", ".mov", ".webm", ".mkv")
IMAGE_EXT = (".jpg", ".jpeg", ".png", ".webp")


def own_media(media_dir: Path, index: int) -> Path | None:
    if not media_dir.is_dir():
        return None
    for ext in VIDEO_EXT + IMAGE_EXT:
        p = media_dir / f"{index}{ext}"
        if p.exists():
            return p
    return None


def pexels_clip(query: str, cache_dir: Path, min_duration: float, used_ids: set[int]) -> Path | None:
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return None
    import requests

    try:
        r = requests.get(
            "https://api.pexels.com/videos/search",
            headers={"Authorization": key},
            params={"query": query, "orientation": "portrait", "per_page": 15, "size": "medium"},
            timeout=30,
        )
        r.raise_for_status()
    except Exception as e:  # network/ratelimit: fall back instead of failing the whole render
        print(f"    pexels search failed for '{query}': {e}")
        return None

    candidates = []
    for v in r.json().get("videos", []):
        if v["id"] in used_ids or v.get("duration", 0) < min(min_duration, 4):
            continue
        files = [
            f for f in v.get("video_files", [])
            if f.get("height") and f.get("width") and f["height"] > f["width"] and f["height"] >= 1280
        ]
        if not files:
            continue
        best = min(files, key=lambda f: abs(f["height"] - 1920))
        candidates.append((v["id"], best["link"]))
    if not candidates:
        return None

    vid_id, link = candidates[0]
    used_ids.add(vid_id)
    cache_dir.mkdir(parents=True, exist_ok=True)
    out = cache_dir / f"pexels_{vid_id}.mp4"
    if not out.exists():
        with requests.get(link, stream=True, timeout=120) as resp:
            resp.raise_for_status()
            with open(out, "wb") as f:
                for chunk in resp.iter_content(1 << 20):
                    f.write(chunk)
    return out


PALETTES = [
    ("0x0f2027", "0x2c5364"), ("0x1a1a2e", "0x0f3460"), ("0x232526", "0x414345"),
    ("0x141e30", "0x243b55"), ("0x2b1055", "0x7597de"), ("0x0b3d2e", "0x1d6b52"),
]


def gradient_spec(index: int) -> str:
    c0, c1 = PALETTES[index % len(PALETTES)]
    return f"gradients=s=1080x1920:c0={c0}:c1={c1}:speed=0.008:rate=30:seed={random.randint(0, 9999)}"
