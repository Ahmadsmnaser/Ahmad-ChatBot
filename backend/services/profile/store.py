"""Lightweight in-memory profile search — no PyTorch or Chroma required.

The profile dataset is small (< 100 chunks from a handful of Markdown files).
Simple keyword-overlap scoring is accurate enough and keeps the memory
footprint negligible, which matters on free-tier deployments (512 MB cap).

The user-upload RAG is unchanged and still uses HuggingFace embeddings,
loaded lazily only when a signed-in user uploads a file.
"""

import logging
import re

from .chunker import ProfileChunk, chunk_profile_pages
from .loader import load_profile_pages

logger = logging.getLogger(__name__)

_CHUNKS: list[ProfileChunk] | None = None


def get_profile_store() -> None:
    """Pre-load profile chunks at startup (fast — just reads Markdown files)."""
    _get_chunks()


def _get_chunks() -> list[ProfileChunk]:
    global _CHUNKS
    if _CHUNKS is None:
        pages = load_profile_pages()
        _CHUNKS = chunk_profile_pages(pages)
        if _CHUNKS:
            logger.info("Profile index: %d chunks from %d sections.", len(_CHUNKS), len(pages))
        else:
            logger.warning("Profile data is empty — fill backend/profile_data/ files.")
    return _CHUNKS


def _score(query: str, text: str) -> float:
    """Word-overlap relevance: fraction of query words found in text."""
    q_words = set(re.findall(r'\w+', query.lower()))
    t_words = set(re.findall(r'\w+', text.lower()))
    if not q_words:
        return 0.0
    return len(q_words & t_words) / len(q_words)


async def search_profile(query: str, top_k: int = 6) -> list[dict]:
    """Return the top_k most relevant profile chunks by keyword overlap."""
    chunks = _get_chunks()
    if not chunks:
        return []

    scored = sorted(
        chunks,
        key=lambda c: _score(query, c["text"] + " " + (c["section_title"] or "")),
        reverse=True,
    )

    return [
        {
            "text": c["text"],
            "source_file": c["source_file"],
            "section_title": c["section_title"],
            "chunk_index": c["chunk_index"],
            "score": round(_score(query, c["text"]), 4),
        }
        for c in scored[:top_k]
    ]
