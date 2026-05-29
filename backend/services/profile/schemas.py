"""Pydantic schemas for the public Ask-Ahmad API."""

from typing import Literal

from pydantic import BaseModel, Field


class AskAhmadRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    mode: Literal["portfolio", "recruiter", "job_match"] = "portfolio"
    job_description: str | None = Field(default=None, max_length=5000)


class ProfileCitation(BaseModel):
    source_file: str
    section_title: str | None = None
    snippet: str
    score: float


class AskAhmadResponse(BaseModel):
    answer: str
    citations: list[ProfileCitation]
    grounded: bool
    confidence: Literal["high", "medium", "low"]
