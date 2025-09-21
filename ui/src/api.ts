export interface Property {
  id: number;
  name: string;
  code: string;
  type: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  total_units?: number | null;
  property_manager?: string | null;
}

export interface Program {
  id: number;
  name: string;
  category: string;
  funding_source?: string | null;
  income_limit_percent: number;
  rent_limit_percent?: number | null;
}

export interface Household {
  id: number;
  unit_id: number;
  name: string;
  move_in_date: string;
  annual_income: number;
  household_size: number;
  voucher_type?: string | null;
}

export interface Unit {
  id: number;
  property_id: number;
  number: string;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number | null;
  ami_percent?: number | null;
  status: string;
}

export interface ComplianceIssue {
  household_id: number;
  household_name: string;
  program_name: string;
  issue: string;
  severity: string;
  next_due_date: string;
}

export interface CreatePropertyPayload {
  name: string;
  code: string;
  type: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  total_units?: number | null;
  property_manager?: string | null;
}

export interface CreateProgramPayload {
  name: string;
  category: string;
  funding_source?: string | null;
  income_limit_percent: number;
  rent_limit_percent?: number | null;
}

export interface CreateHouseholdPayload {
  unit_id: number;
  name: string;
  move_in_date: string;
  annual_income: number;
  household_size: number;
  voucher_type?: string | null;
}

export interface CreateComplianceEventPayload {
  household_id: number;
  program_id: number;
  event_type: string;
  finding: string;
  severity: string;
  occurred_on: string;
  resolved_on?: string | null;
  notes?: string | null;
}

const API_BASE = import.meta.env?.VITE_API_BASE ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  getProperties: () => request<Property[]>("/properties/"),
  createProperty: (payload: CreatePropertyPayload) =>
    request<Property>("/properties/", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getPrograms: () => request<Program[]>("/programs/"),
  createProgram: (payload: CreateProgramPayload) =>
    request<Program>("/programs/", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getHouseholds: () => request<Household[]>("/households/"),
  createHousehold: (payload: CreateHouseholdPayload) =>
    request<Household>("/households/", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getUnits: () => request<Unit[]>("/units/"),
  getComplianceIssues: () => request<ComplianceIssue[]>("/compliance/issues"),
  createComplianceEvent: (payload: CreateComplianceEventPayload) =>
    request("/compliance/events", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
