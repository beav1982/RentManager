"""Data access helpers for database operations."""

from __future__ import annotations

from datetime import date
from typing import Iterable, List, Optional

from sqlmodel import SQLModel, Session, select

from . import models


def create_property(session: Session, property_in: models.Property) -> models.Property:
    session.add(property_in)
    session.commit()
    session.refresh(property_in)
    return property_in


def list_properties(session: Session) -> List[models.Property]:
    return session.exec(select(models.Property)).all()


def create_unit(session: Session, unit_in: models.Unit) -> models.Unit:
    session.add(unit_in)
    session.commit()
    session.refresh(unit_in)
    return unit_in


def list_units(session: Session, property_id: Optional[int] = None) -> List[models.Unit]:
    statement = select(models.Unit)
    if property_id is not None:
        statement = statement.where(models.Unit.property_id == property_id)
    return session.exec(statement).all()


def create_household(session: Session, household_in: models.Household) -> models.Household:
    session.add(household_in)
    session.commit()
    session.refresh(household_in)
    return household_in


def get_household(session: Session, household_id: int) -> Optional[models.Household]:
    return session.get(models.Household, household_id)


def list_households(session: Session, property_id: Optional[int] = None) -> List[models.Household]:
    statement = select(models.Household)
    if property_id is not None:
        statement = statement.join(
            models.Unit, models.Unit.id == models.Household.unit_id
        ).where(models.Unit.property_id == property_id)
    return session.exec(statement).all()


def create_resident(session: Session, resident_in: models.Resident) -> models.Resident:
    session.add(resident_in)
    session.commit()
    session.refresh(resident_in)
    return resident_in


def list_residents(session: Session, household_id: Optional[int] = None) -> List[models.Resident]:
    statement = select(models.Resident)
    if household_id is not None:
        statement = statement.where(models.Resident.household_id == household_id)
    return session.exec(statement).all()


def create_program(session: Session, program_in: models.Program) -> models.Program:
    session.add(program_in)
    session.commit()
    session.refresh(program_in)
    return program_in


def list_programs(session: Session) -> List[models.Program]:
    return session.exec(select(models.Program)).all()


def create_certification(session: Session, certification_in: models.Certification) -> models.Certification:
    session.add(certification_in)
    session.commit()
    session.refresh(certification_in)
    return certification_in


def list_certifications(
    session: Session,
    household_id: Optional[int] = None,
    program_id: Optional[int] = None,
) -> List[models.Certification]:
    statement = select(models.Certification)
    if household_id is not None:
        statement = statement.where(models.Certification.household_id == household_id)
    if program_id is not None:
        statement = statement.where(models.Certification.program_id == program_id)
    return session.exec(statement).all()


def create_compliance_event(
    session: Session,
    event_in: models.ComplianceEvent,
) -> models.ComplianceEvent:
    session.add(event_in)
    session.commit()
    session.refresh(event_in)
    return event_in


def list_compliance_events(session: Session, household_id: Optional[int] = None) -> List[models.ComplianceEvent]:
    statement = select(models.ComplianceEvent)
    if household_id is not None:
        statement = statement.where(models.ComplianceEvent.household_id == household_id)
    return session.exec(statement).all()


def create_waitlist_applicant(
    session: Session,
    applicant_in: models.WaitlistApplicant,
) -> models.WaitlistApplicant:
    session.add(applicant_in)
    session.commit()
    session.refresh(applicant_in)
    return applicant_in


def list_waitlist_applicants(session: Session, property_id: Optional[int] = None) -> List[models.WaitlistApplicant]:
    statement = select(models.WaitlistApplicant)
    if property_id is not None:
        statement = statement.where(models.WaitlistApplicant.property_id == property_id)
    return session.exec(statement).all()


def create_inspection(session: Session, inspection_in: models.Inspection) -> models.Inspection:
    session.add(inspection_in)
    session.commit()
    session.refresh(inspection_in)
    return inspection_in


def list_inspections(session: Session, property_id: Optional[int] = None) -> List[models.Inspection]:
    statement = select(models.Inspection)
    if property_id is not None:
        statement = statement.where(models.Inspection.property_id == property_id)
    return session.exec(statement).all()


def create_transaction(
    session: Session,
    transaction_in: models.FinancialTransaction,
) -> models.FinancialTransaction:
    session.add(transaction_in)
    session.commit()
    session.refresh(transaction_in)
    return transaction_in


def list_transactions(
    session: Session,
    property_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> List[models.FinancialTransaction]:
    statement = select(models.FinancialTransaction)
    if property_id is not None:
        statement = statement.where(models.FinancialTransaction.property_id == property_id)
    if start_date is not None:
        statement = statement.where(models.FinancialTransaction.transaction_date >= start_date)
    if end_date is not None:
        statement = statement.where(models.FinancialTransaction.transaction_date <= end_date)
    return session.exec(statement).all()


def bulk_create(session: Session, items: Iterable[SQLModel]) -> None:
    for item in items:
        session.add(item)
    session.commit()
