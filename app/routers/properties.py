"""Property endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from .. import crud, models, schemas
from ..db import get_session

router = APIRouter()


@router.post("/", response_model=schemas.PropertyRead, status_code=201)
def create_property(
    payload: schemas.PropertyCreate,
    session: Session = Depends(get_session),
) -> schemas.PropertyRead:
    existing = session.exec(
        select(models.Property).where(models.Property.code == payload.code)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Property code already exists")
    property_in = models.Property(**payload.dict())
    return crud.create_property(session, property_in)


@router.get("/", response_model=list[schemas.PropertyRead])
def list_properties(session: Session = Depends(get_session)) -> list[schemas.PropertyRead]:
    return crud.list_properties(session)


@router.get("/{property_id}", response_model=schemas.PropertyRead)
def get_property(property_id: int, session: Session = Depends(get_session)) -> schemas.PropertyRead:
    property_ = session.get(models.Property, property_id)
    if property_ is None:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_
