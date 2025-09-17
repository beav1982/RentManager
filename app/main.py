"""FastAPI application factory for the RentManager tool."""

from __future__ import annotations

from fastapi import FastAPI, status
from fastapi.responses import RedirectResponse

from .db import init_db
from .routers import (
    compliance,
    households,
    programs,
    properties,
    reports,
    transactions,
    units,
)


def create_app() -> FastAPI:
    app = FastAPI(
        title="RentManager Internal Tool",
        description=(
            "Operational hub for affordable housing management, inspired by "
            "Yardi Voyager Affordable Housing."
        ),
        version="0.1.0",
    )

    @app.on_event("startup")
    def _startup() -> None:
        init_db()

    @app.get("/", include_in_schema=False)
    def root() -> RedirectResponse:
        return RedirectResponse(url="/docs", status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    app.include_router(properties.router, prefix="/properties", tags=["properties"])
    app.include_router(units.router, prefix="/units", tags=["units"])
    app.include_router(programs.router, prefix="/programs", tags=["programs"])
    app.include_router(households.router, prefix="/households", tags=["households"])
    app.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
    app.include_router(reports.router, prefix="/reports", tags=["reports"])
    app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])

    @app.get("/health", tags=["monitoring"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
