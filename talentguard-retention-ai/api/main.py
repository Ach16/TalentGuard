import json
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from .schemas import (
    HealthResponse, MetricsResponse, WatchlistResponse,
    WhatIfRequest, WhatIfResponse, EmployeeBasic, EmployeeDetails
)
from src import config
from src.data import load_data
from src.whatif import what_if

app = FastAPI(title="TalentGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# App state to cache models and data
state = {}

@app.on_event("startup")
def load_resources():
    try:
        metrics_path = config.OUTPUTS_DIR / "metrics.json"
        if metrics_path.exists():
            with open(metrics_path) as f:
                metrics = json.load(f)
            model_name = metrics.get('selected_model', 'logreg')
            model_path = config.MODELS_DIR / f"model_{model_name}.joblib"
            if model_path.exists():
                state['model'] = joblib.load(model_path)
                
        if config.DATASET_PATH.exists():
            X, y, emp_ids = load_data()
            state['X'] = X
            state['emp_ids'] = emp_ids
            
            oof_path = config.OUTPUTS_DIR / "oof_scores.csv"
            if oof_path.exists():
                state['oof_scores'] = pd.read_csv(oof_path)
    except Exception as e:
        print(f"Error loading resources: {e}")

@app.get("/health", response_model=HealthResponse)
def health_check():
    models_ready = (config.MODELS_DIR / "model_logreg.joblib").exists()
    data_ready = config.DATASET_PATH.exists()
    return HealthResponse(
        status="ok",
        models_ready=models_ready,
        data_ready=data_ready
    )

@app.get("/api/v1/metrics", response_model=MetricsResponse)
def get_metrics():
    metrics_path = config.OUTPUTS_DIR / "metrics.json"
    if not metrics_path.exists():
        raise HTTPException(status_code=404, detail="Metrics not found. Run training pipeline first.")
    with open(metrics_path) as f:
        return json.load(f)

@app.get("/api/v1/watchlist", response_model=WatchlistResponse)
def get_watchlist():
    csv_path = config.OUTPUTS_DIR / "watchlist.csv"
    summary_path = config.OUTPUTS_DIR / "business_summary.json"
    
    if not csv_path.exists() or not summary_path.exists():
        raise HTTPException(status_code=404, detail="Watchlist not generated. Run python -m src.watchlist")
        
    df = pd.read_csv(csv_path)
    # Fill NaN strings (like action for ranks > 10) with empty string
    df = df.fillna("")
    
    with open(summary_path) as f:
        summary = json.load(f)
        
    items = df.to_dict(orient="records")
    return {"summary": summary, "items": items}

@app.get("/api/v1/watchlist/download")
def download_watchlist():
    csv_path = config.OUTPUTS_DIR / "watchlist.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Watchlist not found.")
    return FileResponse(csv_path, filename="watchlist.csv", media_type="text/csv")

@app.get("/api/v1/watchlist/{employee_id}", response_model=EmployeeDetails)
def get_watchlist_employee(employee_id: int):
    if 'X' not in state:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    X = state['X']
    emp_ids = state['emp_ids']
    
    idx = emp_ids[emp_ids == employee_id].index
    if len(idx) == 0:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found")
        
    row = X.iloc[idx[0]]
    
    return EmployeeDetails(
        EmployeeNumber=employee_id,
        OverTime=str(row['OverTime']),
        MonthlyIncome=float(row['MonthlyIncome']),
        BusinessTravel=str(row['BusinessTravel']),
        JobSatisfaction=int(row['JobSatisfaction'])
    )

@app.get("/api/v1/employees", response_model=list[EmployeeBasic])
def get_employees():
    if 'oof_scores' not in state:
        raise HTTPException(status_code=503, detail="OOF scores not loaded")
    
    df = state['oof_scores']
    # Return top 100 for the dropdown to bound response size
    top = df.sort_values(by='risk', ascending=False).head(100)
    
    res = []
    for _, row in top.iterrows():
        res.append(EmployeeBasic(EmployeeNumber=int(row['EmployeeNumber']), risk=float(row['risk'])))
    return res

@app.post("/api/v1/what-if", response_model=WhatIfResponse)
def compute_what_if(req: WhatIfRequest):
    if 'model' not in state or 'X' not in state:
        raise HTTPException(status_code=503, detail="Model or data not loaded")
        
    X = state['X']
    emp_ids = state['emp_ids']
    model = state['model']
    
    idx = emp_ids[emp_ids == req.employee_id].index
    if len(idx) == 0:
        raise HTTPException(status_code=404, detail=f"Employee {req.employee_id} not found")
        
    row = X.iloc[[idx[0]]].copy()
    
    try:
        before, after = what_if(model, row, req.changes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
        
    delta_pct = (after - before) * 100
    
    return WhatIfResponse(
        prob_before=before,
        prob_after=after,
        delta_pct=delta_pct
    )

from .schemas import ExpectedLossResponse, ActionDraft
from typing import List, Dict, Any

@app.get("/api/v1/analytics/expected-loss", response_model=ExpectedLossResponse)
def get_expected_loss():
    csv_path = config.OUTPUTS_DIR / "top50_by_cost.csv"
    summary_path = config.OUTPUTS_DIR / "expected_loss_summary.json"
    
    if not csv_path.exists() or not summary_path.exists():
        raise HTTPException(status_code=404, detail="Expected loss data not generated.")
        
    df = pd.read_csv(csv_path)
    with open(summary_path) as f:
        summary = json.load(f)
        
    return ExpectedLossResponse(
        items=df.to_dict(orient="records"),
        assumptions=summary["assumptions"],
        overlap_with_risk_top50=summary["overlap_with_risk_top50"]
    )

@app.get("/api/v1/analytics/fairness")
def get_fairness():
    path = config.OUTPUTS_DIR / "fairness_audit.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Fairness audit not generated.")
    with open(path) as f:
        return json.load(f)

@app.get("/api/v1/analytics/hotspots")
def get_hotspots():
    dept_path = config.OUTPUTS_DIR / "department_hotspots.csv"
    role_path = config.OUTPUTS_DIR / "jobrole_hotspots.csv"
    if not dept_path.exists() or not role_path.exists():
        raise HTTPException(status_code=404, detail="Hotspots not generated.")
        
    dept_df = pd.read_csv(dept_path)
    role_df = pd.read_csv(role_path)
    
    return {
        "departments": dept_df.to_dict(orient="records"),
        "roles": role_df.to_dict(orient="records")
    }

@app.get("/api/v1/analytics/action-drafts", response_model=List[ActionDraft])
def get_action_drafts():
    path = config.OUTPUTS_DIR / "retention_action_drafts.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Action drafts not generated.")
    with open(path) as f:
        return json.load(f)
