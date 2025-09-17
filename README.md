# RentManager Internal Tool

RentManager is a FastAPI-based internal tool inspired by the capabilities of Yardi Voyager Affordable Housing. It centralises compliance tracking, household certifications, waitlist management, and financial reporting for affordable housing operators.

## Features

- **Property & Unit Management** – Create properties and units with AMI designations.
- **Households & Residents** – Manage households, resident rosters, and compliance certifications across affordable programs.
- **Compliance Monitoring** – Automated alerts for overdue certifications, income limit breaches, and outstanding findings.
- **Financial Tracking** – Record revenues/expenses and generate occupancy, rent roll, and NOI reports.
- **REST API** – Modular endpoints ready for integration with internal portals or data pipelines.

## Project Structure

```
app/
├── crud.py                 # Database helpers
├── db.py                   # Engine and session management
├── main.py                 # FastAPI application factory
├── models.py               # SQLModel table definitions
├── routers/                # REST endpoints
├── schemas.py              # Pydantic models for I/O
└── services/               # Compliance & financial analytics
```

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the API locally:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Explore the interactive docs at `http://127.0.0.1:8000/docs`.

## Running Tests

```bash
pytest
```

## Sample Workflow

1. Create a property and units via `/properties` and `/units`.
2. Register affordable programs under `/programs` and assign households through `/households`.
3. Capture certifications and residents to feed compliance analytics.
4. Record transactions with `/transactions` and review financial health using `/reports` endpoints.
5. Monitor compliance readiness at `/compliance/issues`.

The tool stores data in a local SQLite database (`rentmanager.db`) by default and can be adapted to other SQL backends supported by SQLModel.
