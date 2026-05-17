# Chatbot Development Plan

A staged refactoring and feature-development plan for `Ahmad's Chatbot`.
Each phase builds on the previous one — do not skip ahead.

---

## Phase 1: Foundation & Security

**Goal:** Lock down secrets and clean up project hygiene before touching code.

1. **Create `.gitignore`**
   - Ignore `.env`, `__pycache__/`, `*.pyc`, `.streamlit/secrets.toml`, `.vscode/`, `*.log`, virtual environment folders.
2. **Fix `env_template.txt`**
   - Remove spaces around `=`. `python-dotenv` silently fails to parse `KEY = value`.
   - Correct format: `GROQ_API_KEY=your-key-here`.
3. **Create `README.md`**
   - Project description, setup steps, how to get a Groq API key, how to run locally, environment variables, troubleshooting.
4. **Clean up `devcontainer.json`**
   - Remove `apt upgrade -y` from `updateContentCommand` — it slows every rebuild and is not needed.
   - Keep `apt update` and `pip install` only.

**Why first:** One-time setup. Prevents accidental commits of secrets before any refactor.

---

## Phase 2: Restructure Into Modules

**Goal:** Separate concerns. Make the codebase scalable.

### Target structure

```
project/
├── .env
├── .gitignore
├── README.md
├── requirements.txt
├── config.py          # env loading + validation + constants
├── llm.py             # LLM initialization (cached) + invocation
├── chat_history.py    # history management + persistence
├── ui.py              # streamlit UI components
└── chatbot.py         # entry point — wires everything together
```

### Steps

5. **`config.py`**
   - Load `.env`, validate `GROQ_API_KEY` exists (raise clear error if missing).
   - Constants: default model, default temperature, max history length, max input length, log file path.
6. **`llm.py`**
   - `get_llm(model: str, temperature: float)` decorated with `@st.cache_resource`.
   - `invoke_llm(messages, model, temperature)` with try/except for API errors.
   - `stream_llm(...)` for streaming variant.
7. **`chat_history.py`**
   - `init_history()`, `add_message(role, content)`, `clear_history()`, `trim_history(max_n)`.
   - `save_history(path)`, `load_history(path)` for persistence.
8. **`ui.py`**
   - `render_sidebar()` — model selector, temperature, system prompt, clear button, stats.
   - `render_chat_messages()` — replay history.
   - `render_chat_input()` — input handling + invocation.
9. **`chatbot.py`**
   - Thin entry point — page config + module orchestration only.

**Why second:** Adding features to spaghetti code is painful. Restructure first.

---

## Phase 3: Robustness

**Goal:** App should never crash on user.

10. **Type hints + docstrings**
    - Every function gets typed signatures and a one-line docstring.
11. **Error handling around `llm.invoke`**
    - Catch `groq.RateLimitError`, `groq.APIError`, network errors.
    - Show user-friendly error in chat (`st.error` or assistant message), not a stack trace.
12. **Input validation**
    - Reject empty messages.
    - Enforce max input length (e.g. 4000 chars).
13. **History trimming**
    - Keep only the last N messages (configurable, default ~20) to stay within context window.
    - Always preserve the system message.
14. **Logging**
    - Use Python `logging` module.
    - Log: errors, model calls, response times, token counts.
    - Write to file + console.

---

## Phase 4: UX Polish

**Goal:** App feels professional.

15. **Sidebar controls**
    - Model selector (dropdown: `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, etc.).
    - Temperature slider (0.0 – 2.0).
    - Editable system prompt (textarea).
    - "Clear Chat" button with confirmation.
    - Message counter + approximate token counter.
16. **Streaming responses**
    - Replace `llm.invoke()` with `llm.stream()`.
    - Use `st.write_stream()` to render tokens as they arrive.
17. **Loading feedback**
    - If not streaming, wrap call in `st.spinner("Thinking...")`.
18. **Response metadata**
    - Small caption under each assistant message: model used, response time, token count.

---

## Phase 5: Persistence

**Goal:** Chat history survives page refresh and process restart.

19. **Save / load history**
    - Persist `st.session_state.chat_history` to local JSON file (or SQLite for multiple sessions).
    - On app load, restore previous session.
20. **Multiple chat sessions** *(optional stretch)*
    - Sidebar list of past conversations.
    - "New Chat" button.
    - Each chat has a unique ID and auto-generated title (first user message or LLM-generated).

---

## Suggested Order of Execution

| Phase | Estimated effort | Priority |
|-------|------------------|----------|
| 1. Foundation & Security | 30 min | Critical |
| 2. Restructure | 1.5 – 2 hrs | High |
| 3. Robustness | 1 hr | High |
| 4. UX Polish | 1.5 – 2 hrs | Medium |
| 5. Persistence | 1 – 2 hrs | Medium |

---

## Out of Scope (Future Ideas)

- Authentication / multi-user support.
- Deployment to Streamlit Cloud / Docker / Fly.io.
- RAG (file upload + vector search).
- Tool calling / function calling.
- Voice input/output.
- Conversation export (Markdown / PDF).
- Unit tests with `pytest`.
- CI/CD pipeline (GitHub Actions).