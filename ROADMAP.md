# Production Roadmap

Three pillars: **real database**, **Google auth with per-user data**, and **production deployment**.

---

## Current State

| Layer | Now |
|---|---|
| Chat storage | JSON files in `/backend/data/chats/` |
| Vector store | Chroma in-memory, per-session |
| Auth | None — CORS only |
| Settings | localStorage (browser only, not synced) |
| Deployment | Local dev only |

---

## Pillar 1 — Real Database

### Chosen Stack
- **PostgreSQL** — primary relational store (users, chats, messages, settings)
- **Chroma Cloud** or **pgvector** — vector store for RAG (replaces in-memory Chroma)
- **SQLAlchemy 2 + Alembic** — ORM and schema migrations

### Schema

```sql
users (id, email, name, avatar_url, created_at)
chats (id, user_id, title, mode, model, created_at, updated_at)
messages (id, chat_id, role, content, reasoning, citations, created_at)
user_settings (user_id, language, theme, font_size, sound, updated_at)
rag_documents (id, chat_id, filename, chunk_count, uploaded_at)
```

### Steps

1. **Add dependencies**
   ```
   sqlalchemy[asyncio], asyncpg, alembic, pgvector (optional)
   ```

2. **Create `backend/database.py`**
   - Async SQLAlchemy engine + session factory
   - `get_db()` dependency for FastAPI

3. **Create `backend/models_db.py`**
   - SQLAlchemy ORM models matching the schema above

4. **Write Alembic migrations**
   - `alembic init alembic`
   - First migration: create all tables

5. **Replace `chat_store.py`**
   - Rewrite all CRUD operations to use the DB session
   - Keep the same function signatures so `main.py` changes are minimal

6. **Migrate RAG vector store**
   - Option A (simpler): Chroma Cloud — keep existing LangChain integration, just point to remote
   - Option B (self-hosted): pgvector extension on the same Postgres instance

7. **Environment variables to add**
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname
   ```

---

## Pillar 2 — Google Sign-In + Per-User Data

### Chosen Stack
- **NextAuth.js v5** — Google OAuth in the Next.js frontend
- **JWT tokens** — frontend sends `Authorization: Bearer <token>` to backend
- **FastAPI dependency** — backend verifies the token and injects `current_user`

### Auth Flow

```
User clicks "Sign in with Google"
  → NextAuth redirects to Google
  → Google returns to /api/auth/callback/google
  → NextAuth creates a session + JWT
  → Frontend stores JWT, sends it on every API call
  → FastAPI verifies JWT, resolves user_id
  → All DB queries are scoped to that user_id
```

### Frontend Steps

1. **Install NextAuth v5**
   ```bash
   npm install next-auth@beta
   ```

2. **Create `frontend/src/app/api/auth/[...nextauth]/route.ts`**
   ```ts
   import NextAuth from "next-auth";
   import Google from "next-auth/providers/google";

   export const { handlers, auth, signIn, signOut } = NextAuth({
     providers: [Google],
     callbacks: {
       async jwt({ token, account }) {
         if (account) token.accessToken = account.id_token;
         return token;
       },
       async session({ session, token }) {
         session.accessToken = token.accessToken;
         return session;
       },
     },
   });
   ```

3. **Wrap app in `SessionProvider`** in `frontend/src/app/layout.tsx`

4. **Add login gate** in `ChatApp.tsx`
   - If no session → show `<SignInPage />` component
   - If session → show chat UI as today

5. **Attach token to every API call** in `frontend/src/lib/api.ts`
   ```ts
   headers: { Authorization: `Bearer ${session.accessToken}` }
   ```

6. **Add env vars**
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://yourdomain.com
   ```

### Backend Steps

1. **Add dependencies**
   ```
   google-auth, python-jose[cryptography]
   ```

2. **Create `backend/auth.py`**
   ```python
   from google.oauth2 import id_token
   from google.auth.transport import requests

   async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
       payload = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
       user = await get_or_create_user(db, email=payload["email"], ...)
       return user
   ```

3. **Scope all endpoints to the authenticated user**
   - `GET /api/chats` → returns only `WHERE user_id = current_user.id`
   - `POST /api/chats` → inserts with `user_id = current_user.id`
   - `GET /api/chats/{id}` → 403 if `chat.user_id != current_user.id`
   - etc.

4. **Migrate user settings** from localStorage to `user_settings` table
   - `GET /api/settings` and `PUT /api/settings` endpoints
   - Frontend `useSettings` hook reads/writes via API instead of localStorage

5. **Add env vars**
   ```
   GOOGLE_CLIENT_ID=...
   ```

---

## Pillar 3 — Production Deployment

### Recommended Stack

| Service | What it runs | Why |
|---|---|---|
| **Vercel** | Next.js frontend | Zero-config, free tier, edge CDN |
| **Railway** or **Render** | FastAPI backend | Simple Docker deploys, free tier available |
| **Supabase** or **Neon** | PostgreSQL | Managed Postgres, generous free tier, pgvector support |

### Steps

#### 3.1 — Dockerize the Backend

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `backend/.dockerignore`:
```
__pycache__/
data/
.env
venv/
```

#### 3.2 — Deploy Backend to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway new
railway up
```

Set environment variables in Railway dashboard:
```
GROQ_API_KEY
DATABASE_URL
GOOGLE_CLIENT_ID
ALLOWED_ORIGINS=https://yourdomain.vercel.app
```

#### 3.3 — Deploy Frontend to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL=https://yourdomain.vercel.app
```

#### 3.4 — Database Setup (Supabase)

1. Create project at supabase.com
2. Copy connection string → set as `DATABASE_URL`
3. Enable pgvector extension (if using pgvector for RAG):
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Run Alembic migrations against the production DB:
   ```bash
   DATABASE_URL=<prod_url> alembic upgrade head
   ```

#### 3.5 — Google OAuth Configuration

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   ```
   https://yourdomain.vercel.app/api/auth/callback/google
   ```

#### 3.6 — CI/CD (Optional but Recommended)

Create `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Implementation Order

Work in this sequence to avoid blocking dependencies:

```
Week 1 — Database
  [ ] Set up Supabase (or local Postgres for dev)
  [ ] Add SQLAlchemy + Alembic, create models
  [ ] Replace chat_store.py with DB-backed CRUD
  [ ] Test all chat endpoints still work

Week 2 — Auth
  [ ] Add NextAuth + Google provider to frontend
  [ ] Add JWT verification to backend (auth.py)
  [ ] Scope all DB queries by user_id
  [ ] Migrate settings to DB (GET/PUT /api/settings)
  [ ] Test full sign-in flow locally

Week 3 — Deployment
  [ ] Dockerize backend, test locally
  [ ] Deploy backend to Railway, point to Supabase
  [ ] Deploy frontend to Vercel
  [ ] Configure Google OAuth redirect URIs for prod
  [ ] Smoke-test the full flow end-to-end
  [ ] Set up CI/CD pipeline
```

---

## Environment Variables Summary

### Backend (`.env`)
```
GROQ_API_KEY=
DATABASE_URL=postgresql+asyncpg://...
GOOGLE_CLIENT_ID=
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.vercel.app
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```