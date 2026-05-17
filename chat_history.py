"""Chat history module — manages conversation state, persistence, and multiple sessions."""

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any

import streamlit as st

from config import MAX_HISTORY_LENGTH, logger

# ── Constants ─────────────────────────────────────────────────────────────────
SESSIONS_DIR = os.path.join(os.path.dirname(__file__), "chat_sessions")


# ── Session management ───────────────────────────────────────────────────────

def _ensure_sessions_dir() -> None:
    """Create the sessions directory if it doesn't exist."""
    os.makedirs(SESSIONS_DIR, exist_ok=True)


def _session_path(session_id: str) -> str:
    """Return the file path for a given session ID."""
    return os.path.join(SESSIONS_DIR, f"{session_id}.json")


def _generate_title(messages: list[dict]) -> str:
    """Auto-generate a session title from the first user message."""
    for msg in messages:
        if msg["role"] == "user":
            text = msg["content"].strip()
            return text[:50] + ("…" if len(text) > 50 else "")
    return "New Chat"


def list_sessions() -> list[dict]:
    """Return a list of all saved sessions, sorted by last modified (newest first).

    Each item: {"id": str, "title": str, "updated_at": str, "message_count": int}
    """
    _ensure_sessions_dir()
    sessions = []
    for filename in os.listdir(SESSIONS_DIR):
        if not filename.endswith(".json"):
            continue
        path = os.path.join(SESSIONS_DIR, filename)
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            sessions.append({
                "id": data["id"],
                "title": data.get("title", "Untitled"),
                "updated_at": data.get("updated_at", ""),
                "message_count": len(data.get("messages", [])),
            })
        except (json.JSONDecodeError, KeyError):
            logger.warning("Skipping corrupt session file: %s", filename)
    sessions.sort(key=lambda s: s["updated_at"], reverse=True)
    return sessions


def create_new_session() -> str:
    """Create a new empty session and return its ID."""
    session_id = uuid.uuid4().hex[:12]
    st.session_state.chat_history = []
    st.session_state.current_session_id = session_id
    logger.info("Created new session: %s", session_id)
    return session_id


def load_session(session_id: str) -> None:
    """Load a session from disk into session state."""
    path = _session_path(session_id)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        st.session_state.chat_history = data.get("messages", [])
        st.session_state.current_session_id = session_id
        logger.info("Loaded session: %s (%d messages)", session_id, len(st.session_state.chat_history))
    except (FileNotFoundError, json.JSONDecodeError):
        logger.warning("Failed to load session %s, creating new one", session_id)
        create_new_session()


def save_session() -> None:
    """Persist the current session to disk."""
    _ensure_sessions_dir()
    session_id = st.session_state.get("current_session_id")
    if not session_id:
        return

    messages = st.session_state.get("chat_history", [])
    if not messages:
        return  # don't save empty sessions

    data = {
        "id": session_id,
        "title": _generate_title(messages),
        "created_at": _get_or_set_created_at(session_id),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "messages": messages,
    }

    path = _session_path(session_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.debug("Saved session %s (%d messages)", session_id, len(messages))


def _get_or_set_created_at(session_id: str) -> str:
    """Read the created_at timestamp from an existing file, or generate a new one."""
    path = _session_path(session_id)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("created_at", datetime.now(timezone.utc).isoformat())
    except (FileNotFoundError, json.JSONDecodeError):
        return datetime.now(timezone.utc).isoformat()


def delete_session(session_id: str) -> None:
    """Delete a session file from disk."""
    path = _session_path(session_id)
    try:
        os.remove(path)
        logger.info("Deleted session: %s", session_id)
    except FileNotFoundError:
        pass


# ── In-memory history operations ─────────────────────────────────────────────

def init_history() -> None:
    """Initialise session state: load the most recent session or create a new one."""
    if "chat_history" not in st.session_state:
        sessions = list_sessions()
        if sessions:
            load_session(sessions[0]["id"])
        else:
            create_new_session()


def add_message(role: str, content: str, metadata: dict[str, Any] | None = None) -> None:
    """Append a message to the chat history and auto-save."""
    msg: dict[str, Any] = {"role": role, "content": content}
    if metadata:
        msg["metadata"] = metadata
    st.session_state.chat_history.append(msg)
    save_session()


def get_history() -> list[dict]:
    """Return the current chat history (including metadata)."""
    return st.session_state.chat_history


def get_llm_messages(system_prompt: str) -> list[dict]:
    """Return message list formatted for the LLM (system prompt + history without metadata)."""
    messages = [{"role": "system", "content": system_prompt}]
    for msg in st.session_state.chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    return messages


def clear_history() -> None:
    """Clear all messages from the current session and delete its file."""
    session_id = st.session_state.get("current_session_id")
    if session_id:
        delete_session(session_id)
    create_new_session()


def trim_history(max_n: int = MAX_HISTORY_LENGTH) -> None:
    """Keep only the last *max_n* messages to stay within the context window."""
    history = st.session_state.chat_history
    if len(history) > max_n:
        st.session_state.chat_history = history[-max_n:]
        save_session()


def estimate_tokens() -> int:
    """Rough token estimate (~4 chars per token) for the current history."""
    total_chars = sum(len(m["content"]) for m in st.session_state.chat_history)
    return total_chars // 4
