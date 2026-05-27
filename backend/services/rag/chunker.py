"""Split page text into overlapping chunks using CharacterTextSplitter."""

from typing import TypedDict

from langchain_text_splitters import CharacterTextSplitter

from .extractor import PageChunk


class Chunk(TypedDict):
    text: str
    fileName: str
    pageNumber: int | None
    chunkIndex: int


def chunk_pages(
    pages: list[PageChunk],
    chunk_size: int = 600,
    overlap: int = 80,
) -> list[Chunk]:
    """Split pages into overlapping text chunks."""
    splitter = CharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separator="\n",
    )
    chunks: list[Chunk] = []
    idx = 0

    for page in pages:
        for segment in splitter.split_text(page["text"]):
            chunks.append({
                "text": segment,
                "fileName": page["source_file"],
                "pageNumber": page["page_number"],
                "chunkIndex": idx,
            })
            idx += 1

    return chunks
