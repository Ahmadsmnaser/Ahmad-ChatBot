"""Ahmad's Chatbot — entry point. Wires configuration, UI, and modules together."""

import streamlit as st

import config  # noqa: F401 — triggers env validation on import
from chat_history import init_history
from ui import render_sidebar, render_chat_messages, render_chat_input


# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Ahmad's Chatbot",
    page_icon="🤖",
    layout="centered",
    initial_sidebar_state="expanded",
)

st.title("Ahmad's Chatbot 🤖")

# ── Initialise state ─────────────────────────────────────────────────────────
init_history()

# ── Render UI ─────────────────────────────────────────────────────────────────
render_sidebar()
render_chat_messages()
render_chat_input()
