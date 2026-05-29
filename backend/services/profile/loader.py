"""Load Ahmad's profile Markdown files into section-aware page chunks."""

import re
from pathlib import Path
from typing import TypedDict

PROFILE_DATA_DIR = Path(__file__).parent.parent.parent / "profile_data"


class ProfilePage(TypedDict):
    text: str
    source_file: str
    section_title: str | None


def load_profile_pages() -> list[ProfilePage]:
    """Read all .md files in profile_data/ and split them by ## headings."""
    pages: list[ProfilePage] = []

    for md_file in sorted(PROFILE_DATA_DIR.glob("*.md")):
        raw = md_file.read_text(encoding="utf-8")
        source = md_file.name
        _split_into_sections(raw, source, pages)

    return pages


def _split_into_sections(raw: str, source_file: str, out: list[ProfilePage]) -> None:
    """Split a Markdown document into sections at ## headings.

    Sections with only TODO comments or empty content are skipped so the
    vector store does not index placeholder text.
    """
    # Split on any ## or ### heading (keep the heading as part of the section)
    parts = re.split(r"(?m)^(#{1,3} .+)$", raw)

    current_title: str | None = None
    current_text: list[str] = []

    def flush() -> None:
        text = "\n".join(current_text).strip()
        # Skip sections that contain no real content (only comments / TODO)
        content_lines = [
            ln for ln in text.splitlines()
            if ln.strip() and not ln.strip().startswith("<!--") and not ln.strip() == "-->"
        ]
        if content_lines:
            out.append({
                "text": text,
                "source_file": source_file,
                "section_title": current_title,
            })

    for part in parts:
        if re.match(r"^#{1,3} ", part):
            flush()
            current_title = part.lstrip("#").strip()
            current_text = [part]
        else:
            current_text.append(part)

    flush()
