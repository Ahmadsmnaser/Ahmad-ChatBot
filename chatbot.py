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

# ── BiDi (RTL / LTR) text support ────────────────────────────────────────────
st.markdown("""
<style>
    /* Each text element auto-detects its direction from content */
    [data-testid="stChatMessage"] p,
    [data-testid="stChatMessage"] li,
    [data-testid="stChatMessage"] h1,
    [data-testid="stChatMessage"] h2,
    [data-testid="stChatMessage"] h3,
    [data-testid="stChatMessage"] h4,
    [data-testid="stChatMessage"] h5,
    [data-testid="stChatMessage"] h6,
    [data-testid="stChatMessage"] blockquote,
    [data-testid="stChatMessage"] td,
    [data-testid="stChatMessage"] th {
        unicode-bidi: plaintext;
        text-align: start;
    }

    /* Lists — markers follow the text direction */
    [data-testid="stChatMessage"] ol,
    [data-testid="stChatMessage"] ul {
        unicode-bidi: plaintext;
        text-align: start;
    }

    /* Code blocks always LTR */
    [data-testid="stChatMessage"] pre,
    [data-testid="stChatMessage"] code {
        direction: ltr !important;
        text-align: left !important;
        unicode-bidi: embed;
    }

    /* Chat input auto-direction */
    [data-testid="stChatInput"] textarea {
        unicode-bidi: plaintext;
    }
</style>
""", unsafe_allow_html=True)

# ── Initialise state ─────────────────────────────────────────────────────────
init_history()

# ── Render UI ─────────────────────────────────────────────────────────────────
render_sidebar()
render_chat_messages()
render_chat_input()
