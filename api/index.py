"""Vercel serverless entrypoint exposing the FastAPI application."""

from app.main import app

__all__ = ["app"]
