"""UI module — Streamlit components for the chatbot interface."""

import time

import streamlit as st

from config import (
    AVAILABLE_MODELS,
    DEFAULT_MODEL,
    DEFAULT_SYSTEM_PROMPT,
    DEFAULT_TEMPERATURE,
    MAX_INPUT_LENGTH,
    logger,
)
from chat_history import (
    get_history,
    get_llm_messages,
    add_message,
    clear_history,
    trim_history,
    estimate_tokens,
    list_sessions,
    create_new_session,
    load_session,
    delete_session,
)
from llm import stream_llm


# ── Sidebar ───────────────────────────────────────────────────────────────────

def render_sidebar() -> None:
    """Render the sidebar with sessions, model selector, temperature, system prompt, and stats."""
    with st.sidebar:

        # ── Chat Sessions ─────────────────────────────────────────────────
        st.header("💬 Chats")

        if st.button("➕ New Chat", use_container_width=True):
            create_new_session()
            st.rerun()

        sessions = list_sessions()
        current_id = st.session_state.get("current_session_id", "")

        for session in sessions:
            col_title, col_del = st.columns([5, 1])
            is_active = session["id"] == current_id

            with col_title:
                label = f"{'▶ ' if is_active else ''}{session['title']}"
                if st.button(
                    label,
                    key=f"load_{session['id']}",
                    use_container_width=True,
                    disabled=is_active,
                ):
                    load_session(session["id"])
                    st.rerun()

            with col_del:
                if st.button(
                    "🗑",
                    key=f"del_{session['id']}",
                    help="Delete this chat",
                ):
                    was_active = is_active
                    delete_session(session["id"])
                    if was_active:
                        create_new_session()
                    st.rerun()

        st.divider()

        # ── Settings ──────────────────────────────────────────────────────
        st.header("⚙️ Settings")

        # Model selector
        st.selectbox(
            "Model",
            options=AVAILABLE_MODELS,
            index=AVAILABLE_MODELS.index(DEFAULT_MODEL),
            key="selected_model",
        )

        # Temperature slider
        st.slider(
            "Temperature",
            min_value=0.0,
            max_value=2.0,
            value=DEFAULT_TEMPERATURE,
            step=0.1,
            key="selected_temperature",
            help="Higher = more creative, Lower = more focused",
        )

        st.divider()

        # System prompt
        st.text_area(
            "System Prompt",
            value=DEFAULT_SYSTEM_PROMPT,
            key="system_prompt",
            height=100,
            help="Instructions that guide the assistant's behaviour",
        )

        st.divider()

        # Clear chat with confirmation
        if "confirm_clear" not in st.session_state:
            st.session_state.confirm_clear = False

        if not st.session_state.confirm_clear:
            if st.button("🗑️ Clear Chat", use_container_width=True):
                st.session_state.confirm_clear = True
                st.rerun()
        else:
            st.warning("Are you sure?")
            col1, col2 = st.columns(2)
            with col1:
                if st.button("✅ Yes", use_container_width=True):
                    logger.info("Chat history cleared by user")
                    clear_history()
                    st.session_state.confirm_clear = False
                    st.rerun()
            with col2:
                if st.button("❌ No", use_container_width=True):
                    st.session_state.confirm_clear = False
                    st.rerun()

        st.divider()

        # Stats
        history = get_history()
        st.caption(f"💬 Messages: {len(history)}")
        st.caption(f"🔤 Est. tokens: ~{estimate_tokens():,}")


# ── Chat messages ─────────────────────────────────────────────────────────────

def render_chat_messages() -> None:
    """Replay all messages from the chat history, with metadata captions."""
    for message in get_history():
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

            # Show metadata for assistant messages
            meta = message.get("metadata")
            if meta and message["role"] == "assistant":
                parts = []
                if "model" in meta:
                    parts.append(f"📦 {meta['model']}")
                if "time" in meta:
                    parts.append(f"⏱️ {meta['time']:.2f}s")
                if "tokens" in meta:
                    usage = meta["tokens"]
                    parts.append(
                        f"🔤 {usage.get('total_tokens', '?')} tokens"
                    )
                if parts:
                    st.caption(" · ".join(parts))


# ── Chat input ────────────────────────────────────────────────────────────────

def render_chat_input() -> None:
    """Handle user input, validate it, stream the LLM response, and display metadata."""
    user_prompt = st.chat_input("Ask Me Anything!")

    if not user_prompt:
        return

    # ── Input validation ──────────────────────────────────────────────────
    stripped = user_prompt.strip()

    if not stripped:
        st.warning("Please enter a message.")
        logger.debug("Empty message rejected")
        return

    if len(stripped) > MAX_INPUT_LENGTH:
        st.warning(
            f"Message too long ({len(stripped):,} chars). "
            f"Maximum is {MAX_INPUT_LENGTH:,} characters."
        )
        logger.warning("Message rejected: %d chars (max %d)", len(stripped), MAX_INPUT_LENGTH)
        return

    # ── Show and store the user message ───────────────────────────────────
    st.chat_message("user").markdown(stripped)
    add_message("user", stripped)
    logger.info("User message: %d chars", len(stripped))

    # ── Read sidebar settings ─────────────────────────────────────────────
    model: str = st.session_state.get("selected_model", DEFAULT_MODEL)
    temperature: float = st.session_state.get("selected_temperature", DEFAULT_TEMPERATURE)
    system_prompt: str = st.session_state.get("system_prompt", DEFAULT_SYSTEM_PROMPT)

    # ── Build the message list ────────────────────────────────────────────
    messages = get_llm_messages(system_prompt)

    # ── Stream the response ───────────────────────────────────────────────
    start = time.time()

    with st.chat_message("assistant"):
        response_text = st.write_stream(
            stream_llm(messages, model=model, temperature=temperature)
        )
        elapsed = time.time() - start

        # Metadata caption
        st.caption(f"📦 {model} · ⏱️ {elapsed:.2f}s")

    # ── Store with metadata ───────────────────────────────────────────────
    add_message("assistant", response_text, metadata={
        "model": model,
        "time": round(elapsed, 2),
    })

    # ── Trim history to stay within context window ────────────────────────
    trim_history()
