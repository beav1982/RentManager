"""Pydantic schemas used by FastAPI endpoints."""

from __future__ import annotations

from datetime import date
from typing import Dict, Optional

from pydantic import BaseModel, Field


class PropertyBase(BaseModel):
    name: str
    code: str
    type: str = "Affordable"
    address_line1: str
    city: str
    state: str
    postal_code: str
    total_units: Optional[int] = None
    property_manager: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyRead(PropertyBase):
    id: int

    class Config:
        orm_mode = True


class UnitBase(BaseModel):
    property_id: int
    number: str
    bedrooms: int
    bathrooms: float
    square_feet: Optional[int] = None
    ami_percent: Optional[int] = None
    status: str = "Vacant"


class UnitCreate(UnitBase):
    pass


class UnitRead(UnitBase):
    id: int

    class Config:
        orm_mode = True


class ProgramBase(BaseModel):
    name: str
    category: str
    funding_source: Optional[str] = None
    income_limit_percent: int = Field(..., ge=0, le=120)
    rent_limit_percent: Optional[int] = Field(default=None, ge=0, le=120)


class ProgramCreate(ProgramBase):
    pass


class ProgramRead(ProgramBase):
    id: int

    class Config:
        orm_mode = True


class HouseholdBase(BaseModel):
    unit_id: int
    name: str
    move_in_date: date
    annual_income: float
    household_size: int
    voucher_type: Optional[str] = None


class HouseholdCreate(HouseholdBase):
    pass


class HouseholdRead(HouseholdBase):
    id: int

    class Config:
        orm_mode = True


class ResidentBase(BaseModel):
    household_id: int
    first_name: str
    last_name: str
    date_of_birth: date
    relationship: str
    disability_status: Optional[str] = None
    monthly_income: Optional[float] = None


class ResidentCreate(ResidentBase):
    pass


class ResidentRead(ResidentBase):
    id: int

    class Config:
        orm_mode = True


class CertificationBase(BaseModel):
    household_id: int
    program_id: int
    effective_date: date
    next_due_date: date
    household_income: float
    contract_rent: float
    tenant_rent: float
    utility_allowance: float
    status: str = "Active"


class CertificationCreate(CertificationBase):
    pass


class CertificationRead(CertificationBase):
    id: int

    class Config:
        orm_mode = True


class ComplianceEventCreate(BaseModel):
    household_id: int
    program_id: int
    event_type: str
    finding: str
    severity: str
    occurred_on: date
    resolved_on: Optional[date] = None
    notes: Optional[str] = None


class ComplianceEventRead(ComplianceEventCreate):
    id: int

    class Config:
        orm_mode = True


class WaitlistApplicantBase(BaseModel):
    property_id: int
    applicant_name: str
    household_size: int
    income: float
    priority_score: float
    status: str = "Active"


class WaitlistApplicantCreate(WaitlistApplicantBase):
    pass


class WaitlistApplicantRead(WaitlistApplicantBase):
    id: int

    class Config:
        orm_mode = True


class InspectionBase(BaseModel):
    property_id: int
    inspection_type: str
    scheduled_for: date
    completed_on: Optional[date] = None
    passed: Optional[bool] = None
    notes: Optional[str] = None


class InspectionCreate(InspectionBase):
    pass


class InspectionRead(InspectionBase):
    id: int

    class Config:
        orm_mode = True


class FinancialTransactionBase(BaseModel):
    property_id: int
    transaction_date: date
    category: str
    amount: float
    description: Optional[str] = None
    source: str = "tenant"


class FinancialTransactionCreate(FinancialTransactionBase):
    pass


class FinancialTransactionRead(FinancialTransactionBase):
    id: int

    class Config:
        orm_mode = True


class OccupancyReport(BaseModel):
    property_id: int
    property_name: str
    total_units: int
    occupied_units: int
    occupancy_rate: float
    ami_average: Optional[float]


class ComplianceIssue(BaseModel):
    household_id: int
    household_name: str
    program_name: str
    issue: str
    severity: str
    next_due_date: date


class RentProjection(BaseModel):
    property_id: int
    property_name: str
    monthly_rent_roll: float
    subsidy_share: float
    tenant_share: float


class NOIReport(BaseModel):
    net_operating_income: float
    summary: Dict[str, float]
