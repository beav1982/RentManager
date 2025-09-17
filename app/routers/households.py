"""Household and resident endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from .. import crud, models, schemas
from ..db import get_session

router = APIRouter()


@router.post("/", response_model=schemas.HouseholdRead, status_code=201)
def create_household(
    payload: schemas.HouseholdCreate,
    session: Session = Depends(get_session),
) -> schemas.HouseholdRead:
    unit = session.get(models.Unit, payload.unit_id)
    if unit is None:
        raise HTTPException(status_code=404, detail="Unit not found")
    household_in = models.Household(**payload.dict())
    return crud.create_household(session, household_in)


@router.get("/", response_model=list[schemas.HouseholdRead])
def list_households(
    property_id: int | None = None,
    session: Session = Depends(get_session),
) -> list[schemas.HouseholdRead]:
    return crud.list_households(session, property_id)


@router.get("/{household_id}", response_model=schemas.HouseholdRead)
def get_household(
    household_id: int,
    session: Session = Depends(get_session),
) -> schemas.HouseholdRead:
    household = crud.get_household(session, household_id)
    if household is None:
        raise HTTPException(status_code=404, detail="Household not found")
    return household


@router.post("/{household_id}/residents", response_model=schemas.ResidentRead, status_code=201)
def add_resident(
    household_id: int,
    payload: schemas.ResidentCreate,
    session: Session = Depends(get_session),
) -> schemas.ResidentRead:
    household = crud.get_household(session, household_id)
    if household is None:
        raise HTTPException(status_code=404, detail="Household not found")
    if payload.household_id != household_id:
        raise HTTPException(status_code=400, detail="Household mismatch in payload")
    resident_in = models.Resident(**payload.dict())
    return crud.create_resident(session, resident_in)


@router.get("/{household_id}/residents", response_model=list[schemas.ResidentRead])
def list_residents(
    household_id: int,
    session: Session = Depends(get_session),
) -> list[schemas.ResidentRead]:
    household = crud.get_household(session, household_id)
    if household is None:
        raise HTTPException(status_code=404, detail="Household not found")
    return crud.list_residents(session, household_id)


@router.post(
    "/{household_id}/certifications",
    response_model=schemas.CertificationRead,
    status_code=201,
)
def create_certification(
    household_id: int,
    payload: schemas.CertificationCreate,
    session: Session = Depends(get_session),
) -> schemas.CertificationRead:
    household = crud.get_household(session, household_id)
    if household is None:
        raise HTTPException(status_code=404, detail="Household not found")
    if payload.household_id != household_id:
        raise HTTPException(status_code=400, detail="Household mismatch in payload")
    program = session.get(models.Program, payload.program_id)
    if program is None:
        raise HTTPException(status_code=404, detail="Program not found")
    certification_in = models.Certification(**payload.dict())
    return crud.create_certification(session, certification_in)


@router.get("/{household_id}/certifications", response_model=list[schemas.CertificationRead])
def list_certifications(
    household_id: int,
    session: Session = Depends(get_session),
) -> list[schemas.CertificationRead]:
    household = crud.get_household(session, household_id)
    if household is None:
        raise HTTPException(status_code=404, detail="Household not found")
    return crud.list_certifications(session, household_id=household_id)
