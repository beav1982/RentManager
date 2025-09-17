"""Reporting endpoints for operations dashboards."""

from __future__ import annotations

from datetime import date
from typing import Dict

from fastapi import APIRouter, Depends
from sqlmodel import Session

from .. import schemas
from ..db import get_session
from ..services import financials

router = APIRouter()


@router.get("/occupancy", response_model=list[schemas.OccupancyReport])
def occupancy_report(
    property_id: int | None = None,
    session: Session = Depends(get_session),
) -> list[schemas.OccupancyReport]:
    return financials.occupancy_reports(session, property_id)


@router.get("/rent", response_model=list[schemas.RentProjection])
def rent_report(
    property_id: int | None = None,
    session: Session = Depends(get_session),
) -> list[schemas.RentProjection]:
    return financials.rent_projection(session, property_id)


@router.get("/operating-summary", response_model=Dict[str, float])
def operating_report(
    property_id: int | None = None,
    start: date | None = None,
    end: date | None = None,
    session: Session = Depends(get_session),
) -> Dict[str, float]:
    return financials.operating_summary(session, property_id=property_id, start=start, end=end)


@router.get("/noi", response_model=schemas.NOIReport)
def net_operating_income_report(
    property_id: int | None = None,
    start: date | None = None,
    end: date | None = None,
    session: Session = Depends(get_session),
) -> schemas.NOIReport:
    summary = financials.operating_summary(
        session, property_id=property_id, start=start, end=end
    )
    noi = financials.net_operating_income(summary)
    return schemas.NOIReport(net_operating_income=noi, summary=summary)
