"""Data model for a short-form video script.

The same schema is used for Claude's structured output and for the
script.json file you review and edit before rendering.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from pydantic import BaseModel, Field


class Source(BaseModel):
    claim: str = Field(description="The specific fact from the narration that this source backs up.")
    url: str = Field(description="URL of the page that states this fact.")


class Segment(BaseModel):
    narration: str = Field(description="What the voice says in this segment. One or two short spoken sentences.")
    visual_query: str = Field(
        description="2-4 word English stock-footage search query showing something concrete and filmable, e.g. 'octopus underwater'."
    )


class VideoScript(BaseModel):
    title: str = Field(description="Upload title, max ~70 characters, no clickbait lies.")
    segments: list[Segment] = Field(description="The video in spoken order. The first segment is the hook.")
    description: str = Field(description="Upload description, 1-3 sentences.")
    hashtags: list[str] = Field(description="3-6 hashtags without the # sign.")
    sources: list[Source] = Field(description="One entry per factual claim in the narration.")
    uncertain_claims: list[str] = Field(
        description="Claims in the narration that the research did NOT clearly confirm, or where sources disagree. Empty if none."
    )


def word_count(script: VideoScript) -> int:
    return sum(len(s.narration.split()) for s in script.segments)


def content_hash(script: VideoScript) -> str:
    """Hash of everything that ends up in the video. Approval is tied to this,
    so editing the script after approving it requires approving again."""
    payload = json.dumps(script.model_dump(), sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


class Project:
    """A folder under projects/ holding one video: script.json, approval, work files, output."""

    def __init__(self, root: Path):
        self.root = root
        self.script_path = root / "script.json"
        self.review_path = root / "REVIEW.md"
        self.approval_path = root / "approved.txt"
        self.media_dir = root / "media"      # optional: your own clips/images, named 1.mp4, 2.jpg, ...
        self.work_dir = root / "work"
        self.out_dir = root / "output"

    def load(self) -> VideoScript:
        return VideoScript.model_validate_json(self.script_path.read_text(encoding="utf-8"))

    def save(self, script: VideoScript) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        self.script_path.write_text(
            json.dumps(script.model_dump(), indent=2, ensure_ascii=False), encoding="utf-8"
        )

    def is_approved(self) -> bool:
        if not self.approval_path.exists():
            return False
        return self.approval_path.read_text(encoding="utf-8").strip() == content_hash(self.load())

    def approve(self) -> None:
        self.approval_path.write_text(content_hash(self.load()), encoding="utf-8")
