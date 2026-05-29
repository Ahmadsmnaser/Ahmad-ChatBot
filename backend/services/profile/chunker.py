"""Chunk profile sections into overlapping text pieces with rich metadata."""

from typing import TypedDict

from langchain_text_splitters import CharacterTextSplitter

from .loader import ProfilePage


class ProfileChunk(TypedDict):
    text: str
    source_file: str
    section_title: str | None
    chunk_index: int


def chunk_profile_pages(
    pages: list[ProfilePage],
    chunk_size: int = 500,
    overlap: int = 60,
) -> list[ProfileChunk]:
    """Split profile sections into overlapping chunks."""
    splitter = CharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separator="\n",
    )
    chunks: list[ProfileChunk] = []
    idx = 0

    for page in pages:
        for segment in splitter.split_text(page["text"]):
            chunks.append({
                "text": segment,
                "source_file": page["source_file"],
                "section_title": page["section_title"],
                "chunk_index": idx,
            })
            idx += 1

    return chunks
