"""Financial analytics for the RentManager tool."""

from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Dict, List, Optional

from sqlmodel import Session, select

from .. import models, schemas


def occupancy_reports(session: Session, property_id: Optional[int] = None) -> List[schemas.OccupancyReport]:
    """Compute occupancy and affordability metrics for each property."""

    property_stmt = select(models.Property)
    if property_id is not None:
        property_stmt = property_stmt.where(models.Property.id == property_id)
    properties = session.exec(property_stmt).all()
    reports: List[schemas.OccupancyReport] = []
    for property_ in properties:
        units = session.exec(
            select(models.Unit).where(models.Unit.property_id == property_.id)
        ).all()
        unit_by_id = {unit.id: unit for unit in units}
        total_units = len(units)
        household_units = {
            household.unit_id
            for household in session.exec(
                select(models.Household).join(
                    models.Unit, models.Unit.id == models.Household.unit_id
                ).where(models.Unit.property_id == property_.id)
            ).all()
        }
        occupied_units = len(household_units)
        occupancy_rate = (occupied_units / total_units) * 100 if total_units else 0
        ami_values = [unit_by_id[uid].ami_percent for uid in household_units if unit_by_id[uid].ami_percent]
        ami_average = sum(ami_values) / len(ami_values) if ami_values else None
        reports.append(
            schemas.OccupancyReport(
                property_id=property_.id,
                property_name=property_.name,
                total_units=total_units,
                occupied_units=occupied_units,
                occupancy_rate=round(occupancy_rate, 2),
                ami_average=ami_average,
            )
        )
    return reports


def rent_projection(session: Session, property_id: Optional[int] = None) -> List[schemas.RentProjection]:
    """Summaries of subsidy vs tenant rent for the rent roll."""

    statement = (
        select(models.Property)
        if property_id is None
        else select(models.Property).where(models.Property.id == property_id)
    )
    projections: List[schemas.RentProjection] = []
    for property_ in session.exec(statement).all():
        cert_stmt = (
            select(models.Certification, models.Household, models.Unit)
            .join(models.Household, models.Household.id == models.Certification.household_id)
            .join(models.Unit, models.Unit.id == models.Household.unit_id)
            .where(models.Unit.property_id == property_.id)
            .where(models.Certification.status == "Active")
        )
        tenant_share = 0.0
        subsidy_share = 0.0
        for certification, household, unit in session.exec(cert_stmt).all():
            tenant_share += certification.tenant_rent
            subsidy_share += certification.contract_rent - certification.tenant_rent
        projections.append(
            schemas.RentProjection(
                property_id=property_.id,
                property_name=property_.name,
                monthly_rent_roll=round(tenant_share + subsidy_share, 2),
                subsidy_share=round(subsidy_share, 2),
                tenant_share=round(tenant_share, 2),
            )
        )
    return projections


def operating_summary(
    session: Session,
    *,
    property_id: Optional[int] = None,
    start: Optional[date] = None,
    end: Optional[date] = None,
) -> Dict[str, float]:
    """Aggregate transactions into revenue and expense totals."""

    stmt = select(models.FinancialTransaction)
    if property_id is not None:
        stmt = stmt.where(models.FinancialTransaction.property_id == property_id)
    if start is not None:
        stmt = stmt.where(models.FinancialTransaction.transaction_date >= start)
    if end is not None:
        stmt = stmt.where(models.FinancialTransaction.transaction_date <= end)

    buckets: Dict[str, float] = defaultdict(float)
    for transaction in session.exec(stmt).all():
        buckets[transaction.category] += transaction.amount
    return dict(buckets)


def net_operating_income(summary: Dict[str, float]) -> float:
    """Derive net operating income from category totals."""

    revenue = sum(amount for category, amount in summary.items() if category.lower().startswith("revenue"))
    expenses = sum(amount for category, amount in summary.items() if category.lower().startswith("expense"))
    return round(revenue - expenses, 2)


def apply_budget_variance(actuals: Dict[str, float], budget: Dict[str, float]) -> Dict[str, float]:
    """Compute variance between actuals and budget expectations."""

    variance: Dict[str, float] = {}
    keys = set(actuals) | set(budget)
    for key in keys:
        variance[key] = round(actuals.get(key, 0.0) - budget.get(key, 0.0), 2)
    return variance
