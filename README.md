# Ahmad's Chatbot

A production-ready AI chat application and personal portfolio assistant built with Next.js and FastAPI. The app has two distinct modes: a **public portfolio assistant** that lets anyone ask questions about Ahmad Naser, and a **private chat** with document Q&A for signed-in users.

---

## Ask Ahmad's Bot (Public)

No sign-in required. When a visitor opens the app without an account, they land on the public portfolio assistant.

Visitors can ask natural questions about Ahmad's background, projects, skills, and experience. The assistant answers using a verified profile knowledge base — it will never invent facts, companies, dates, or skills. If the information is not in the profile, it says so.

**Three question modes:**

| Mode | Purpose |
|---|---|
| Portfolio | General questions about Ahmad's work and background |
| Recruiter | Structured answers optimised for hiring decisions |
| Job Match | Paste a job description and evaluate Ahmad's fit against it |

**Suggested questions shown to visitors:**
- Who is Ahmad Naser?
- What are Ahmad's strongest projects?
- Is Ahmad a good fit for backend roles?
- Is Ahmad a good fit for systems / low-level roles?
- Explain Ahmad's best projects in detail
- Compare Ahmad to this job description

**How to update the profile:**

Edit any file in `backend/profile_data/` and restart the backend. The index rebuilds automatically from disk on startup.

```
backend/profile_data/
  about.md        # Summary, identity, what Ahmad is looking for
  experience.md   # Work history and internship details
  projects.md     # Project descriptions and technical highlights
  skills.md       # Languages, tools, frameworks, AI/RAG, systems
  education.md    # Degree, courses, applied learning
  faq.md          # Common recruiter questions with verified answers
  resume.md       # Resume-format overview
  links.md        # GitHub, LinkedIn, portfolio, project URLs
```

> Only add verified, factual information. The assistant prompt explicitly forbids inventing anything not present in these files.

---

## Private Chat (Signed-in users)

Google OAuth sign-in unlocks the full chat experience:

- Persistent chat history across sessions
- Multiple answer modes: Simple, Deep, Exam, Code, Interview
- Upload `.pdf`, `.txt`, or `.md` files and ask questions against them
- Per-user settings: language, font size, theme, sounds
- Reasoning summaries and citation metadata for file-based answers

---

## Features at a Glance

- Public portfolio assistant — no auth required
- Google OAuth sign-in via NextAuth.js
- Streaming assistant responses over Server-Sent Events
- Per-user chat history, messages, and settings backed by PostgreSQL
- Session-scoped RAG over uploaded documents (Chroma + HuggingFace embeddings)
- Profile RAG using lightweight keyword search — no PyTorch at startup
- Multiple Groq-hosted models: Llama 3.1/3.3, Llama 4 Scout, Mixtral, Qwen3, Compound, GPT OSS
- Markdown and syntax-highlighted code rendering
- English / Arabic UI with full RTL support
- SQLite for local development, PostgreSQL/Neon for production
- Docker-ready backend, Vercel frontend, Render deployment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Auth | NextAuth.js v5, Google OAuth |
| Backend | FastAPI, Pydantic, Uvicorn |
| LLM | Groq via LangChain `ChatGroq` (Llama 3.3 70B for public assistant) |
| Profile RAG | Keyword-overlap search over Markdown files — no ML model required |
| User RAG | Chroma vector store, HuggingFace sentence-transformer embeddings |
| Database | SQLAlchemy async ORM, SQLite locally, PostgreSQL/Neon in production |
| Migrations | Alembic |
| Deployment | Vercel (frontend), Render Docker (backend), Neon Postgres |

---

## Project Structure

```
.
├── backend/
│   ├── main.py                 # FastAPI app — all endpoints
│   ├── auth.py                 # Google ID token verification
│   ├── llm.py                  # Groq/LangChain streaming
│   ├── database.py             # Async SQLAlchemy setup
│   ├── models_db.py            # ORM models
│   ├── profile_data/           # Ahmad's verified profile Markdown files
│   └── services/
│       ├── modes.py            # Answer mode configuration
│       ├── rag/                # User-upload RAG (Chroma + HuggingFace)
│       └── profile/            # Public profile RAG (keyword search)
├── frontend/
│   ├── src/app/                # Next.js app router
│   ├── src/components/
│   │   ├── AskAhmadPanel.tsx   # Public portfolio assistant UI
│   │   └── ChatApp.tsx         # Authenticated chat UI
│   ├── src/hooks/              # Chat, sessions, settings, RAG hooks
│   └── src/lib/                # API client, i18n, markdown helpers
├── render.yaml                 # Render backend service definition
└── README.md
```

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/Ahmadsmnaser/Ahmad-ChatBot
cd Ahmad-ChatBot
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

`backend/.env`:

```env
GROQ_API_KEY=your-groq-api-key
GOOGLE_CLIENT_ID=your-google-client-id
DATABASE_URL=sqlite+aiosqlite:///./data/chatbot.db
ALLOWED_ORIGINS=http://localhost:3000
```

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=any-long-random-string
NEXTAUTH_URL=http://localhost:3000
```

```bash
npm run dev
```

Open `http://localhost:3000` — the public assistant loads immediately without signing in.

---

## API Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | — | Health check |
| `GET` | `/api/models` | — | Available LLM models |
| `GET` | `/api/modes` | — | Answer mode configs |
| `POST` | `/api/public/ask-ahmad` | **None** | Public portfolio assistant |
| `POST` | `/api/chat` | Bearer | Stream private chat response |
| `GET` | `/api/chats` | Bearer | List user's chat sessions |
| `POST` | `/api/chats` | Bearer | Create chat session |
| `GET` | `/api/chats/{id}` | Bearer | Load chat with messages |
| `PUT` | `/api/chats/{id}` | Bearer | Rename or save messages |
| `DELETE` | `/api/chats/{id}` | Bearer | Delete chat session |
| `GET` | `/api/settings` | Bearer | Load user settings |
| `PUT` | `/api/settings` | Bearer | Update user settings |
| `POST` | `/api/rag/upload` | Bearer | Upload and index a file |
| `DELETE` | `/api/rag/{session_id}` | Bearer | Clear session files |

Authenticated endpoints require:
```http
Authorization: Bearer <google-id-token>
```

---

## Deployment

- **Frontend:** Vercel — connect the repo, set root to `frontend/`
- **Backend:** Render — Docker build from `backend/Dockerfile`
- **Database:** Neon serverless PostgreSQL

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full checklist.

---

## Notes

- The public assistant uses keyword search over the profile Markdown files — no ML model is loaded at startup, keeping memory usage well within free-tier limits.
- The user-upload RAG (Chroma + HuggingFace embeddings) loads its model lazily on first file upload, not at startup.
- Do not commit `.env` or `.env.local` files.
- Render free services sleep after inactivity; the first request after sleep will be slower.

---

## License

Educational project — part of the AI Agents Course.
