"""LLM module — initialisation and invocation of the Groq-hosted model."""

import time
from typing import Generator

import streamlit as st
from langchain_groq import ChatGroq
from groq import RateLimitError, APIError

from config import DEFAULT_MODEL, DEFAULT_TEMPERATURE, logger


@st.cache_resource
def get_llm(model: str = DEFAULT_MODEL, temperature: float = DEFAULT_TEMPERATURE) -> ChatGroq:
    """Return a cached ChatGroq instance for the given model and temperature."""
    logger.info("Initialising LLM: model=%s, temperature=%s", model, temperature)
    return ChatGroq(
        model=model,
        temperature=temperature,
    )


def invoke_llm(
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    temperature: float = DEFAULT_TEMPERATURE,
) -> str:
    """Send messages to the LLM and return the assistant's reply as a string.

    Handles API errors gracefully and returns user-friendly error messages.
    """
    llm = get_llm(model, temperature)
    start = time.time()

    try:
        response = llm.invoke(messages)
        elapsed = time.time() - start
        token_info = response.response_metadata.get("token_usage", {})
        logger.info(
            "LLM response: model=%s, time=%.2fs, tokens=%s",
            model, elapsed, token_info,
        )
        return response.content

    except RateLimitError:
        logger.warning("Rate limit hit for model=%s", model)
        return "⚠️ Rate limit reached. Please wait a moment and try again."

    except APIError as e:
        logger.error("Groq API error: %s", e)
        return f"⚠️ API error: {e.message if hasattr(e, 'message') else str(e)}"

    except Exception as e:
        logger.exception("Unexpected error during LLM invocation")
        return f"⚠️ Something went wrong: {str(e)}"


def stream_llm(
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    temperature: float = DEFAULT_TEMPERATURE,
) -> Generator[str, None, None]:
    """Stream tokens from the LLM. Yields chunks for use with st.write_stream.

    Handles API errors gracefully.
    """
    llm = get_llm(model, temperature)
    start = time.time()

    try:
        for chunk in llm.stream(messages):
            if chunk.content:
                yield chunk.content
        elapsed = time.time() - start
        logger.info("LLM stream complete: model=%s, time=%.2fs", model, elapsed)

    except RateLimitError:
        logger.warning("Rate limit hit during streaming for model=%s", model)
        yield "⚠️ Rate limit reached. Please wait a moment and try again."

    except APIError as e:
        logger.error("Groq API error during streaming: %s", e)
        yield f"⚠️ API error: {e.message if hasattr(e, 'message') else str(e)}"

    except Exception as e:
        logger.exception("Unexpected error during LLM streaming")
        yield f"⚠️ Something went wrong: {str(e)}"
