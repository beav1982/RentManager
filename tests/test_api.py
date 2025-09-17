from __future__ import annotations

from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.db import get_session
from app.main import create_app


def test_root_redirects_to_docs(client):
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    expected_docs_url = str(client.base_url.join("/docs"))
    assert response.headers["location"] == expected_docs_url


def test_root_redirect_respects_root_path(engine):
    app = create_app()

    def override_get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    root_path = "/prefixed"
    with TestClient(app, root_path=root_path) as root_client:
        response = root_client.get("/", follow_redirects=False)
        expected_docs_url = str(root_client.base_url.join(f"{root_path}/docs"))

    app.dependency_overrides.clear()

    assert response.status_code == 307
    assert response.headers["location"] == expected_docs_url


def test_end_to_end_workflow(client):
    today = date.today()
    property_payload = {
        "name": "Sunrise Homes",
        "code": "SUN01",
        "address_line1": "123 Main St",
        "city": "Denver",
        "state": "CO",
        "postal_code": "80202",
        "total_units": 10,
        "property_manager": "Pat Manager",
    }
    property_resp = client.post("/properties/", json=property_payload)
    assert property_resp.status_code == 201
    property_id = property_resp.json()["id"]

    unit_payload = {
        "property_id": property_id,
        "number": "1A",
        "bedrooms": 2,
        "bathrooms": 1.0,
        "square_feet": 850,
        "ami_percent": 60,
        "status": "Occupied",
    }
    unit_resp = client.post("/units/", json=unit_payload)
    assert unit_resp.status_code == 201
    unit_id = unit_resp.json()["id"]

    program_payload = {
        "name": "LIHTC",
        "category": "Tax Credit",
        "funding_source": "Federal",
        "income_limit_percent": 60,
        "rent_limit_percent": 60,
    }
    program_resp = client.post("/programs/", json=program_payload)
    assert program_resp.status_code == 201
    program_id = program_resp.json()["id"]

    household_payload = {
        "unit_id": unit_id,
        "name": "Garcia Household",
        "move_in_date": today.isoformat(),
        "annual_income": 55000,
        "household_size": 3,
        "voucher_type": "HCV",
    }
    household_resp = client.post("/households/", json=household_payload)
    assert household_resp.status_code == 201
    household_id = household_resp.json()["id"]

    resident_payload = {
        "household_id": household_id,
        "first_name": "Maria",
        "last_name": "Garcia",
        "date_of_birth": (today.replace(year=today.year - 30)).isoformat(),
        "relationship": "Head",
    }
    resident_resp = client.post(
        f"/households/{household_id}/residents",
        json=resident_payload,
    )
    assert resident_resp.status_code == 201

    certification_payload = {
        "household_id": household_id,
        "program_id": program_id,
        "effective_date": today.isoformat(),
        "next_due_date": (today - timedelta(days=1)).isoformat(),
        "household_income": 55000,
        "contract_rent": 1200,
        "tenant_rent": 400,
        "utility_allowance": 100,
        "status": "Active",
    }
    certification_resp = client.post(
        f"/households/{household_id}/certifications",
        json=certification_payload,
    )
    assert certification_resp.status_code == 201

    transaction_payloads = [
        {
            "property_id": property_id,
            "transaction_date": today.isoformat(),
            "category": "revenue-rent",
            "amount": 1200.0,
            "description": "Tenant rent",
            "source": "tenant",
        },
        {
            "property_id": property_id,
            "transaction_date": today.isoformat(),
            "category": "expense-maintenance",
            "amount": 300.0,
            "description": "Repairs",
            "source": "vendor",
        },
    ]
    for payload in transaction_payloads:
        resp = client.post("/transactions/", json=payload)
        assert resp.status_code == 201

    occupancy_resp = client.get("/reports/occupancy", params={"property_id": property_id})
    assert occupancy_resp.status_code == 200
    occupancy_data = occupancy_resp.json()[0]
    assert occupancy_data["occupied_units"] == 1
    assert occupancy_data["total_units"] == 1

    rent_resp = client.get("/reports/rent", params={"property_id": property_id})
    assert rent_resp.status_code == 200
    rent_data = rent_resp.json()[0]
    assert rent_data["monthly_rent_roll"] == 1200.0
    assert rent_data["tenant_share"] == 400.0
    assert rent_data["subsidy_share"] == 800.0

    summary_resp = client.get(
        "/reports/operating-summary",
        params={"property_id": property_id},
    )
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["revenue-rent"] == 1200.0
    assert summary["expense-maintenance"] == 300.0

    noi_resp = client.get("/reports/noi", params={"property_id": property_id})
    assert noi_resp.status_code == 200
    noi_data = noi_resp.json()
    assert noi_data["net_operating_income"] == 900.0

    compliance_resp = client.get("/compliance/issues")
    assert compliance_resp.status_code == 200
    issues = compliance_resp.json()
    assert any("Certification due" in issue["issue"] for issue in issues)
    assert any("exceeds limit" in issue["issue"] for issue in issues)
