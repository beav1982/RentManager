"""Transaction endpoints for revenue and expenses."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from .. import crud, models, schemas
from ..db import get_session

router = APIRouter()


@router.post("/", response_model=schemas.FinancialTransactionRead, status_code=201)
def create_transaction(
    payload: schemas.FinancialTransactionCreate,
    session: Session = Depends(get_session),
) -> schemas.FinancialTransactionRead:
    property_ = session.get(models.Property, payload.property_id)
    if property_ is None:
        raise HTTPException(status_code=404, detail="Property not found")
    transaction_in = models.FinancialTransaction(**payload.dict())
    return crud.create_transaction(session, transaction_in)


@router.get("/", response_model=list[schemas.FinancialTransactionRead])
def list_transactions(
    property_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    session: Session = Depends(get_session),
) -> list[schemas.FinancialTransactionRead]:
    return crud.list_transactions(
        session, property_id=property_id, start_date=start_date, end_date=end_date
    )
