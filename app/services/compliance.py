"""Compliance analytics to mirror Voyager Affordable Housing workflows."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Iterable, List

from sqlalchemy import exists
from sqlmodel import Session, select

from .. import models, schemas


class ComplianceService:
    """Encapsulates eligibility and recertification checks."""

    def __init__(
        self,
        session: Session,
        *,
        area_median_income: float = 65000.0,
        recertification_window: int = 30,
    ) -> None:
        self.session = session
        self.area_median_income = area_median_income
        self.recertification_window = recertification_window

    # ------------------------------------------------------------------
    # Certification monitoring
    # ------------------------------------------------------------------
    def certifications_due(self) -> List[schemas.ComplianceIssue]:
        """Return certifications that are due soon or past due."""

        today = date.today()
        threshold = today + timedelta(days=self.recertification_window)
        statement = (
            select(models.Certification, models.Household, models.Program)
            .join(models.Household, models.Household.id == models.Certification.household_id)
            .join(models.Program, models.Program.id == models.Certification.program_id)
            .where(models.Certification.status == "Active")
            .where(models.Certification.next_due_date <= threshold)
        )
        issues: List[schemas.ComplianceIssue] = []
        for certification, household, program in self.session.exec(statement).all():
            severity = "High" if certification.next_due_date < today else "Medium"
            issue = schemas.ComplianceIssue(
                household_id=household.id,
                household_name=household.name,
                program_name=program.name,
                issue="Certification due",
                severity=severity,
                next_due_date=certification.next_due_date,
            )
            issues.append(issue)
        return issues

    def income_limit_exceptions(self) -> List[schemas.ComplianceIssue]:
        """Identify households whose reported income exceeds program limits."""

        statement = (
            select(models.Certification, models.Household, models.Program)
            .join(models.Household, models.Household.id == models.Certification.household_id)
            .join(models.Program, models.Program.id == models.Certification.program_id)
            .where(models.Certification.status == "Active")
        )
        issues: List[schemas.ComplianceIssue] = []
        for certification, household, program in self.session.exec(statement).all():
            limit = self._income_limit_for_household(program, household)
            if certification.household_income > limit:
                issues.append(
                    schemas.ComplianceIssue(
                        household_id=household.id,
                        household_name=household.name,
                        program_name=program.name,
                        issue=(
                            f"Household income ${certification.household_income:,.0f} "
                            f"exceeds limit ${limit:,.0f}"
                        ),
                        severity="High",
                        next_due_date=certification.next_due_date,
                    )
                )
        return issues

    def households_without_recent_activity(self, months: int = 6) -> List[schemas.ComplianceIssue]:
        """Flag households lacking certifications in the given timeframe."""

        cutoff = date.today() - timedelta(days=months * 30)
        subquery = (
            select(models.Certification.id)
            .where(models.Certification.household_id == models.Household.id)
            .where(models.Certification.effective_date >= cutoff)
        )
        statement = select(models.Household).where(~exists(subquery))
        households = self.session.exec(statement).all()
        issues: List[schemas.ComplianceIssue] = []
        for household in households:
            issues.append(
                schemas.ComplianceIssue(
                    household_id=household.id,
                    household_name=household.name,
                    program_name="All",
                    issue="No recertification activity",
                    severity="Medium",
                    next_due_date=date.today(),
                )
            )
        return issues

    def consolidate_issues(self) -> List[schemas.ComplianceIssue]:
        """Aggregate compliance issues for dashboards."""

        aggregated: List[schemas.ComplianceIssue] = []
        for issue in self.certifications_due():
            aggregated.append(issue)
        for issue in self.income_limit_exceptions():
            aggregated.append(issue)
        for issue in self.households_without_recent_activity():
            aggregated.append(issue)
        return aggregated

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _income_limit_for_household(
        self, program: models.Program, household: models.Household
    ) -> float:
        """Approximate program income limits with a household size bump factor."""

        size_adjustment = max(household.household_size - 4, 0)
        bump = 1 + 0.08 * size_adjustment
        return self.area_median_income * (program.income_limit_percent / 100) * bump


def open_findings(session: Session) -> List[schemas.ComplianceIssue]:
    """Convert unresolved compliance events into issue objects."""

    statement = (
        select(models.ComplianceEvent, models.Program)
        .join(models.Program, models.Program.id == models.ComplianceEvent.program_id)
        .where(models.ComplianceEvent.resolved_on.is_(None))
    )
    issues: List[schemas.ComplianceIssue] = []
    for event, program in session.exec(statement).all():
        household = session.get(models.Household, event.household_id)
        if household is None:
            continue
        issues.append(
            schemas.ComplianceIssue(
                household_id=household.id,
                household_name=household.name,
                program_name=program.name,
                issue=event.finding,
                severity=event.severity,
                next_due_date=event.occurred_on,
            )
        )
    return issues


def combine_issue_sources(
    *collections: Iterable[schemas.ComplianceIssue],
) -> List[schemas.ComplianceIssue]:
    """Merge multiple issue lists while preserving order."""

    aggregated: List[schemas.ComplianceIssue] = []
    for collection in collections:
        aggregated.extend(collection)
    return aggregated
