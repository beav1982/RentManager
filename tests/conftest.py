from __future__ import annotations

from typing import Iterator

import sys
from pathlib import Path
from typing import ForwardRef

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

if sys.version_info >= (3, 12) and not hasattr(ForwardRef._evaluate, "__patched__"):
    _forward_ref_evaluate = ForwardRef._evaluate

    def _patched_forward_ref_evaluate(
        self, globalns, localns, type_params=None, *, recursive_guard=None
    ):
        if recursive_guard is None:
            recursive_guard = set()
        return _forward_ref_evaluate(
            self,
            globalns,
            localns,
            type_params,
            recursive_guard=recursive_guard,
        )

    _patched_forward_ref_evaluate.__patched__ = True  # type: ignore[attr-defined]
    ForwardRef._evaluate = _patched_forward_ref_evaluate  # type: ignore[attr-defined]

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.db import get_session
from app.main import create_app


@pytest.fixture()
def engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture()
def session(engine) -> Iterator[Session]:
    with Session(engine) as session:
        yield session


@pytest.fixture()
def client(engine) -> Iterator[TestClient]:
    app = create_app()

    def override_get_session() -> Iterator[Session]:
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()
