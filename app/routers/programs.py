"""Program endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session

from .. import crud, models, schemas
from ..db import get_session

router = APIRouter()


@router.post("/", response_model=schemas.ProgramRead, status_code=201)
def create_program(
    payload: schemas.ProgramCreate,
    session: Session = Depends(get_session),
) -> schemas.ProgramRead:
    program_in = models.Program(**payload.dict())
    return crud.create_program(session, program_in)


@router.get("/", response_model=list[schemas.ProgramRead])
def list_programs(session: Session = Depends(get_session)) -> list[schemas.ProgramRead]:
    return crud.list_programs(session)
