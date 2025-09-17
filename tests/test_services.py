from __future__ import annotations

from app.services import financials


def test_budget_variance_and_noi():
    summary = {"revenue-rent": 5000.0, "expense-maintenance": 1200.0, "expense-admin": 800.0}
    noi = financials.net_operating_income(summary)
    assert noi == 3000.0

    budget = {"revenue-rent": 5200.0, "expense-maintenance": 1000.0}
    variance = financials.apply_budget_variance(summary, budget)
    assert variance["revenue-rent"] == -200.0
    assert variance["expense-maintenance"] == 200.0
    assert variance["expense-admin"] == 800.0
