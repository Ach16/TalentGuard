import json
import pandas as pd
import joblib

from . import config
from .data import load_data
from .explain import top_reasons
from .actions import apply_recommendations

def generate_watchlist():
    # 1. Load data
    X, y_true, emp_ids = load_data()
    
    # 2. Read selected model's OOF predictions
    oof_df = pd.read_csv(config.OUTPUTS_DIR / "oof_scores.csv")
    
    # 3. Validate predictions
    if len(oof_df) != len(emp_ids):
        raise ValueError("OOF predictions row count does not match dataset row count.")
    if not (oof_df['EmployeeNumber'] == emp_ids).all():
        raise ValueError("OOF predictions EmployeeNumber order does not match dataset.")
        
    # 4. Sort employees by predicted risk descending
    sorted_df = oof_df.sort_values(by='risk', ascending=False).copy()
    
    # 5. Select exactly 50
    if len(sorted_df) < 50:
        raise ValueError("Dataset contains fewer than 50 employees.")
    top50 = sorted_df.head(50).copy()
    top50['rank'] = range(1, 51)
    
    # 6. Generate explanations using logreg
    logreg = joblib.load(config.MODELS_DIR / "model_logreg.joblib")
    
    # Get the indices of the top 50 in the original X
    top50_indices = top50.index.tolist()
    X_top50 = X.iloc[top50_indices].copy()
    
    reasons_list = top_reasons(logreg, X_top50, k=3)
    
    # Format reasons
    reasons_str = [" | ".join(r) for r in reasons_list]
    top50['reasons'] = reasons_str
    
    # 7 & 8. Generate actions for top 10
    top50['action'] = apply_recommendations(reasons_list, top50['rank'])
    
    # Merge MonthlyIncome
    top50['MonthlyIncome'] = X_top50['MonthlyIncome'].values
    
    # Formatting risk_pct
    top50['risk_pct'] = (top50['risk'] * 100).round(1)
    
    # 9. Export exact contract
    out_cols = ['rank', 'EmployeeNumber', 'risk_pct', 'reasons', 'action', 'MonthlyIncome']
    watchlist_out = top50[out_cols]
    watchlist_out.to_csv(config.OUTPUTS_DIR / "watchlist.csv", index=False)
    
    # Business evaluation
    # true labels of top 50
    top50_true = top50['y']
    precision_at_50 = top50_true.mean()
    base_rate = y_true.mean()
    lift = precision_at_50 / base_rate if base_rate > 0 else 0
    leavers_caught = int(top50_true.sum())
    
    assumed_save_rate = 0.20
    people_saved_est = leavers_caught * assumed_save_rate
    salary_months_assumed = 6.0
    
    # Calculate salary cost avoided: average monthly income of SAVED people? 
    # Or just average of the top 50 caught leavers? 
    # "Calculate precision@50 from actual labels solely for offline evaluation."
    # Let's use average salary of the top 50 leavers
    leavers_df = top50[top50['y'] == 1]
    avg_leaver_income = leavers_df['MonthlyIncome'].mean() if not leavers_df.empty else 0
    salary_cost_avoided_est = people_saved_est * avg_leaver_income * salary_months_assumed
    
    summary = {
        "precision_at_50": float(precision_at_50),
        "base_rate": float(base_rate),
        "lift": float(lift),
        "leavers_caught": leavers_caught,
        "assumed_save_rate": assumed_save_rate,
        "people_saved_est": float(people_saved_est),
        "salary_months_assumed": salary_months_assumed,
        "salary_cost_avoided_est": float(salary_cost_avoided_est)
    }
    
    with open(config.OUTPUTS_DIR / "business_summary.json", "w") as f:
        json.dump(summary, f, indent=4)

if __name__ == "__main__":
    generate_watchlist()
