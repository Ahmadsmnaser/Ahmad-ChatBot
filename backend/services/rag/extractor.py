"""Extract text from uploaded files using UnstructuredFileLoader."""

import os
import tempfile
from typing import TypedDict

from langchain_community.document_loaders import UnstructuredFileLoader


class PageChunk(TypedDict):
    text: str
    page_number: int | None
    source_file: str


def extract_text(file_bytes: bytes, filename: str) -> list[PageChunk]:
    """Extract text from file bytes. Raises ValueError on unsupported or empty files."""
    suffix = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        loader = UnstructuredFileLoader(tmp_path, mode="elements")
        docs = loader.load()
    finally:
        os.unlink(tmp_path)

    if not docs:
        raise ValueError("File appears to be empty or unreadable")

    chunks: list[PageChunk] = []
    for doc in docs:
        text = doc.page_content.strip()
        if not text:
            continue
        page_number = doc.metadata.get("page_number")
        chunks.append({
            "text": text,
            "page_number": int(page_number) if page_number is not None else None,
            "source_file": filename,
        })

    if not chunks:
        raise ValueError("File appears to be empty or unreadable")

    return chunks
