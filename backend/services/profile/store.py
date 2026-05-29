"""Singleton Chroma vector store for Ahmad's profile data.

This store is completely separate from the per-session user-upload RAG.
It is loaded once at startup and never mixed with private user data.
"""

import logging

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from .chunker import ProfileChunk, chunk_profile_pages
from .loader import load_profile_pages

logger = logging.getLogger(__name__)

_COLLECTION_NAME = "ahmad_profile"
_EMBEDDINGS: HuggingFaceEmbeddings | None = None
_STORE: Chroma | None = None


def _get_embeddings() -> HuggingFaceEmbeddings:
    global _EMBEDDINGS
    if _EMBEDDINGS is None:
        _EMBEDDINGS = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _EMBEDDINGS


def get_profile_store() -> Chroma:
    """Return the singleton profile Chroma store, building it on first call."""
    global _STORE
    if _STORE is None:
        _STORE = _build_store()
    return _STORE


def _build_store() -> Chroma:
    pages = load_profile_pages()
    chunks: list[ProfileChunk] = chunk_profile_pages(pages)

    store = Chroma(
        collection_name=_COLLECTION_NAME,
        embedding_function=_get_embeddings(),
    )

    if not chunks:
        logger.warning("Profile data is empty — no chunks indexed. Fill backend/profile_data/ files.")
        return store

    docs = [
        Document(
            page_content=c["text"],
            metadata={
                "source_file": c["source_file"],
                "section_title": c["section_title"] or "",
                "chunk_index": c["chunk_index"],
            },
        )
        for c in chunks
    ]
    store.add_documents(docs)
    logger.info("Profile RAG: indexed %d chunks from %d sections.", len(chunks), len(pages))
    return store


async def search_profile(query: str, top_k: int = 5) -> list[dict]:
    """Search the profile store and return ranked chunks with metadata."""
    store = get_profile_store()
    count = store._collection.count()
    if count == 0:
        return []

    k = min(top_k, count)
    results = store.similarity_search_with_relevance_scores(query, k=k)

    return [
        {
            "text": doc.page_content,
            "source_file": doc.metadata["source_file"],
            "section_title": doc.metadata["section_title"] or None,
            "chunk_index": doc.metadata["chunk_index"],
            "score": round(score, 4),
        }
        for doc, score in results
    ]
