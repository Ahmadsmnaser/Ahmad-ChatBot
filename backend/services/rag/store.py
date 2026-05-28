"""Chroma vector store — one collection per session."""

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from .chunker import Chunk

_EMBEDDINGS: HuggingFaceEmbeddings | None = None


def get_embeddings() -> HuggingFaceEmbeddings:
    global _EMBEDDINGS
    if _EMBEDDINGS is None:
        _EMBEDDINGS = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _EMBEDDINGS


class RAGStore:
    def __init__(self, session_id: str) -> None:
        self._session_id = session_id
        self._store = Chroma(
            collection_name=f"session_{session_id}",
            embedding_function=get_embeddings(),
        )

    async def add_chunks(self, chunks: list[Chunk]) -> None:
        if not chunks:
            return
        docs = [
            Document(
                page_content=c["text"],
                metadata={
                    "fileName": c["fileName"],
                    "pageNumber": c["pageNumber"] if c["pageNumber"] is not None else -1,
                    "chunkIndex": c["chunkIndex"],
                },
            )
            for c in chunks
        ]
        self._store.add_documents(docs)

    async def search(self, query: str, top_k: int = 4) -> list[dict]:
        count = self._store._collection.count()
        if count == 0:
            return []

        k = min(top_k, count)
        results = self._store.similarity_search_with_relevance_scores(query, k=k)

        return [
            {
                "text": doc.page_content,
                "fileName": doc.metadata["fileName"],
                "pageNumber": doc.metadata["pageNumber"] if doc.metadata["pageNumber"] != -1 else None,
                "chunkIndex": doc.metadata["chunkIndex"],
                "score": round(score, 4),
            }
            for doc, score in results
        ]

    async def delete_file(self, file_name: str) -> None:
        self._store.delete(where={"fileName": file_name})

    def clear(self) -> None:
        self._store.delete_collection()
