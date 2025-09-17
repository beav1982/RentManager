"""Unit endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from .. import crud, models, schemas
from ..db import get_session

router = APIRouter()


@router.post("/", response_model=schemas.UnitRead, status_code=201)
def create_unit(
    payload: schemas.UnitCreate,
    session: Session = Depends(get_session),
) -> schemas.UnitRead:
    property_ = session.get(models.Property, payload.property_id)
    if property_ is None:
        raise HTTPException(status_code=404, detail="Property not found")
    unit_in = models.Unit(**payload.dict())
    return crud.create_unit(session, unit_in)


@router.get("/", response_model=list[schemas.UnitRead])
def list_units(
    property_id: int | None = None,
    session: Session = Depends(get_session),
) -> list[schemas.UnitRead]:
    return crud.list_units(session, property_id)
