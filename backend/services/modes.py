"""Answer mode configuration — prompts, model defaults, temperature, token limits, and RAG strategy."""

from typing import TypedDict


class ModeConfig(TypedDict):
    label: str
    description: str
    model: str
    model_short: str
    temperature: float
    max_tokens: int
    rag_top_k: int
    prompt: str


MODES: dict[str, ModeConfig] = {
    "simple": {
        "label": "Simple",
        "description": "Clear, beginner-friendly answers",
        "model": "llama-3.1-8b-instant",
        "model_short": "Llama 8B",
        "temperature": 0.4,
        "max_tokens": 512,
        "rag_top_k": 3,
        "prompt": (
            "You are a patient, friendly teacher. Answer in plain language — no jargon, no acronyms "
            "without explanation. Use short sentences and concrete examples a complete beginner can grasp. "
            "If a concept needs an analogy, use one from everyday life. Keep the answer focused and brief: "
            "stop when the question is answered. Never pad or over-explain."
        ),
    },
    "deep": {
        "label": "Deep",
        "description": "Technical, in-depth analysis",
        "model": "llama-3.3-70b-versatile",
        "model_short": "Llama 70B",
        "temperature": 0.05,
        "max_tokens": 4096,
        "rag_top_k": 8,
        "prompt": (
            "You are a domain expert writing for a technically sophisticated audience. Do not simplify. "
            "Go beyond surface-level answers: cover underlying mechanisms, design trade-offs, edge cases, "
            "failure modes, and historical context where relevant. Structure your answer with clear headings. "
            "Back claims with reasoning. If you are uncertain about something, say so explicitly rather than "
            "hedging vaguely."
        ),
    },
    "exam": {
        "label": "Exam",
        "description": "Structured for studying",
        "model": "llama-3.3-70b-versatile",
        "model_short": "Llama 70B",
        "temperature": 0.0,
        "max_tokens": 2048,
        "rag_top_k": 5,
        "prompt": (
            "Structure every answer as a study-ready reference:\n"
            "1. **Definition** — one precise sentence.\n"
            "2. **Key Points** — numbered list of the most important facts, properties, or steps.\n"
            "3. **Example or Analogy** — a concrete illustration that makes the concept stick.\n"
            "4. **Common Mistakes** (if applicable) — what learners typically get wrong.\n"
            "Be deterministic and consistent — a student should get the same answer every time they ask."
        ),
    },
    "code": {
        "label": "Code",
        "description": "Implementation-first, code-heavy",
        "model": "qwen/qwen3-32b",
        "model_short": "Qwen 32B",
        "temperature": 0.0,
        "max_tokens": 2048,
        "rag_top_k": 6,
        "prompt": (
            "You are a senior software engineer. Rules:\n"
            "- Lead with working, runnable code. Never describe what you are about to write — just write it.\n"
            "- Add inline comments only for non-obvious lines. No multi-line comment blocks.\n"
            "- After the code, add a '### Why this works' section in 2–4 bullet points.\n"
            "- If multiple approaches exist, implement the idiomatic one and mention the alternative in one sentence.\n"
            "- If the question is language-agnostic, pick the most widely applicable language and state which one.\n"
            "- Never produce placeholder code (e.g. 'TODO', '...', 'your logic here')."
        ),
    },
    "interview": {
        "label": "Interview",
        "description": "Job interview-style answers",
        "model": "groq/compound",
        "model_short": "Groq Compound",
        "temperature": 0.2,
        "max_tokens": 1536,
        "rag_top_k": 4,
        "prompt": (
            "Answer as a confident, senior candidate in a technical job interview. Rules:\n"
            "- Open with a direct, one-sentence answer — no preamble.\n"
            "- Use the STAR method (Situation → Task → Action → Result) for behavioral questions.\n"
            "- For technical questions: answer → explain reasoning → give a concrete example.\n"
            "- Be concise but substantive. Avoid filler phrases ('Great question', 'Certainly', 'Of course').\n"
            "- Demonstrate depth without rambling. End when the point is made."
        ),
    },
}

# Backward-compatible prompt lookup
MODE_PROMPTS: dict[str, str] = {k: v["prompt"] for k, v in MODES.items()}


def get_mode(mode_id: str) -> ModeConfig:
    """Return mode config, falling back to 'simple' for unknown IDs."""
    return MODES.get(mode_id, MODES["simple"])
