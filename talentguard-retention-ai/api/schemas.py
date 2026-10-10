from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class HealthResponse(BaseModel):
    status: str
    models_ready: bool
    data_ready: bool

class MetricsResponse(BaseModel):
    selected_model: str
    base_rate: float
    models: Dict[str, Any]

class WatchlistItem(BaseModel):
    rank: int
    EmployeeNumber: int
    risk_pct: float
    reasons: str
    action: str
    MonthlyIncome: float

class BusinessSummary(BaseModel):
    precision_at_50: float
    base_rate: float
    lift: float
    leavers_caught: int
    assumed_save_rate: float
    people_saved_est: float
    salary_months_assumed: float
    salary_cost_avoided_est: float

class WatchlistResponse(BaseModel):
    summary: BusinessSummary
    items: List[WatchlistItem]

class WhatIfRequest(BaseModel):
    employee_id: int
    changes: Dict[str, Any]

class WhatIfResponse(BaseModel):
    prob_before: float
    prob_after: float
    delta_pct: float

class EmployeeBasic(BaseModel):
    EmployeeNumber: int
    risk: float

class EmployeeDetails(BaseModel):
    EmployeeNumber: int
    OverTime: str
    MonthlyIncome: float
    BusinessTravel: str
    JobSatisfaction: int
    # Can add other fields if needed for display

class ExpectedLossItem(BaseModel):
    rank_by_loss: int
    EmployeeNumber: int
    risk: float
    MonthlyIncome: float
    expected_loss_score: float

class ExpectedLossResponse(BaseModel):
    items: List[ExpectedLossItem]
    assumptions: Dict[str, Any]
    overlap_with_risk_top50: int

class ActionDraft(BaseModel):
    employee_id: int
    status: str
    to: str
    subject: str
    body: str
    risk_pct: float
    reasons: str
    recommended_action: str
