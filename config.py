"""Configuration module — loads environment variables, sets up logging, and defines constants."""

import logging
import os
import sys
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# ── API Keys ──────────────────────────────────────────────────────────────────
GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY is not set. Create a .env file with your key.")
    print("See env_template.txt for the correct format.")
    sys.exit(1)

# ── Model Defaults ────────────────────────────────────────────────────────────
DEFAULT_MODEL: str = "llama-3.1-8b-instant"
DEFAULT_TEMPERATURE: float = 0.0

# ── Available Models ──────────────────────────────────────────────────────────
AVAILABLE_MODELS: list[str] = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
]

# ── Limits ────────────────────────────────────────────────────────────────────
MAX_HISTORY_LENGTH: int = 20      # max message pairs to keep in context
MAX_INPUT_LENGTH: int = 4000      # max characters per user message

# ── System Prompt ─────────────────────────────────────────────────────────────
DEFAULT_SYSTEM_PROMPT: str = "You are a helpful assistant."

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_FILE: str = "chatbot.log"
LOG_FORMAT: str = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
LOG_LEVEL: int = logging.INFO


def setup_logging() -> logging.Logger:
    """Configure and return the application logger (file + console)."""
    logger = logging.getLogger("chatbot")
    if logger.handlers:
        return logger  # already configured

    logger.setLevel(LOG_LEVEL)

    # File handler
    fh = logging.FileHandler(LOG_FILE, encoding="utf-8")
    fh.setLevel(LOG_LEVEL)
    fh.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(fh)

    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.WARNING)
    ch.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(ch)

    return logger


# Initialise the logger on import
logger: logging.Logger = setup_logging()
