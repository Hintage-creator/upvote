"""Word-by-word highlighted captions as an .ass subtitle file (rendered by ffmpeg/libass)."""
from __future__ import annotations

import re
from pathlib import Path

Word = tuple[str, float, float]

HEADER = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{font},{size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,8,3,2,70,70,620,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

HIGHLIGHT = "&H0000E5FF&"  # ASS colours are BGR: this is a warm yellow


def _ts(t: float) -> str:
    t = max(0.0, t)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def _clean(w: str) -> str:
    return w.replace("{", "").replace("}", "").replace("\\", "")


def chunk_words(words: list[Word], max_words: int = 3, max_chars: int = 16) -> list[list[Word]]:
    """Group words into short caption lines, breaking after punctuation."""
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        text_len = sum(len(x[0]) + 1 for x in cur)
        if len(cur) >= max_words or text_len >= max_chars or re.search(r"[.!?,;:]$", w[0]):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def write_ass(words: list[Word], out: Path, font: str = "Arial Black", size: int = 104, upper: bool = True) -> Path:
    lines = [HEADER.format(font=font, size=size)]
    chunks = chunk_words(words)
    for ci, chunk in enumerate(chunks):
        chunk_end = chunks[ci + 1][0][1] if ci + 1 < len(chunks) else chunk[-1][2] + 0.3
        for wi, (_, start, _) in enumerate(chunk):
            end = chunk[wi + 1][1] if wi + 1 < len(chunk) else chunk_end
            if end <= start:
                continue
            parts = []
            for k, (txt, _, _) in enumerate(chunk):
                txt = _clean(txt.upper() if upper else txt)
                parts.append(f"{{\\c{HIGHLIGHT}}}{txt}{{\\c&H00FFFFFF&}}" if k == wi else txt)
            # small pop-in on the first word of each chunk
            anim = "{\\fscx88\\fscy88\\t(0,80,\\fscx100\\fscy100)}" if wi == 0 else ""
            lines.append(f"Dialogue: 0,{_ts(start)},{_ts(end)},Cap,,0,0,0,,{anim}{' '.join(parts)}")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out
