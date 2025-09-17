"""Compliance endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from .. import crud, models, schemas
from ..db import get_session
from ..services import compliance as compliance_service

router = APIRouter()


@router.get("/issues", response_model=list[schemas.ComplianceIssue])
def compliance_issues(
    include_events: bool = True,
    session: Session = Depends(get_session),
) -> list[schemas.ComplianceIssue]:
    service = compliance_service.ComplianceService(session)
    issues = service.consolidate_issues()
    if include_events:
        issues = compliance_service.combine_issue_sources(
            issues, compliance_service.open_findings(session)
        )
    return issues


@router.post("/events", response_model=schemas.ComplianceEventRead, status_code=201)
def create_event(
    payload: schemas.ComplianceEventCreate,
    session: Session = Depends(get_session),
) -> schemas.ComplianceEventRead:
    household = session.get(models.Household, payload.household_id)
    if household is None:
        raise HTTPException(status_code=404, detail="Household not found")
    program = session.get(models.Program, payload.program_id)
    if program is None:
        raise HTTPException(status_code=404, detail="Program not found")
    event_in = models.ComplianceEvent(**payload.dict())
    return crud.create_compliance_event(session, event_in)


@router.get("/events", response_model=list[schemas.ComplianceEventRead])
def list_events(
    household_id: int | None = None,
    session: Session = Depends(get_session),
) -> list[schemas.ComplianceEventRead]:
    return crud.list_compliance_events(session, household_id)
