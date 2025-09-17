"""Domain models for the RentManager internal tool."""

from __future__ import annotations

from datetime import date
from typing import Optional

from sqlmodel import Field, SQLModel


class Property(SQLModel, table=True):
    """Affordable housing property."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    code: str
    type: str = "Affordable"
    address_line1: str
    city: str
    state: str
    postal_code: str
    total_units: Optional[int] = None
    property_manager: Optional[str] = None


class Unit(SQLModel, table=True):
    """A physical unit associated with a property."""

    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    number: str
    bedrooms: int
    bathrooms: float
    square_feet: Optional[int] = None
    ami_percent: Optional[int] = None
    status: str = "Vacant"


class Program(SQLModel, table=True):
    """Affordable housing or subsidy program."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str
    funding_source: Optional[str] = None
    income_limit_percent: int = Field(description="AMI percentage cap for eligibility.")
    rent_limit_percent: Optional[int] = None


class SubsidyContract(SQLModel, table=True):
    """Program funding contract tied to a property."""

    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    program_id: int = Field(foreign_key="program.id")
    contract_number: str
    start_date: date
    end_date: Optional[date] = None
    compliance_threshold: Optional[int] = Field(
        default=None,
        description="Minimum occupancy percent required to stay compliant.",
    )


class Household(SQLModel, table=True):
    """A family or group leasing a unit."""

    id: Optional[int] = Field(default=None, primary_key=True)
    unit_id: int = Field(foreign_key="unit.id")
    name: str
    move_in_date: date
    annual_income: float
    household_size: int
    voucher_type: Optional[str] = None


class Resident(SQLModel, table=True):
    """Individual member of a household."""

    id: Optional[int] = Field(default=None, primary_key=True)
    household_id: int = Field(foreign_key="household.id")
    first_name: str
    last_name: str
    date_of_birth: date
    relationship: str
    disability_status: Optional[str] = None
    monthly_income: Optional[float] = None


class Certification(SQLModel, table=True):
    """Compliance certification record for a household."""

    id: Optional[int] = Field(default=None, primary_key=True)
    household_id: int = Field(foreign_key="household.id")
    program_id: int = Field(foreign_key="program.id")
    effective_date: date
    next_due_date: date
    household_income: float
    contract_rent: float
    tenant_rent: float
    utility_allowance: float
    status: str = Field(default="Active")


class ComplianceEvent(SQLModel, table=True):
    """Stores compliance findings for audit tracking."""

    id: Optional[int] = Field(default=None, primary_key=True)
    household_id: int = Field(foreign_key="household.id")
    program_id: int = Field(foreign_key="program.id")
    event_type: str
    finding: str
    severity: str
    occurred_on: date
    resolved_on: Optional[date] = None
    notes: Optional[str] = None


class WaitlistApplicant(SQLModel, table=True):
    """Tracks applicants for unit availability management."""

    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    applicant_name: str
    household_size: int
    income: float
    priority_score: float
    status: str = Field(default="Active")


class Inspection(SQLModel, table=True):
    """Physical or file inspection record."""

    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    inspection_type: str
    scheduled_for: date
    completed_on: Optional[date] = None
    passed: Optional[bool] = None
    notes: Optional[str] = None


class FinancialTransaction(SQLModel, table=True):
    """Simple accounting entry for tracking revenue and expense."""

    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    transaction_date: date
    category: str
    amount: float
    description: Optional[str] = None
    source: str = Field(default="tenant")
