import json
import pandas as pd
from src import config
from src.data import load_data

def generate_expected_loss():
    # Assumptions
    SALARY_MONTHS_COST = 6.0
    
    # Load data
    X, y, emp_ids = load_data()
    
    # Read OOF predictions
    oof_df = pd.read_csv(config.OUTPUTS_DIR / "oof_scores.csv")
    
    # Merge MonthlyIncome
    X_copy = X.copy()
    X_copy['EmployeeNumber'] = emp_ids
    X_copy['MonthlyIncome'] = X['MonthlyIncome'].values
    
    df = pd.merge(oof_df, X_copy[['EmployeeNumber', 'MonthlyIncome']], on='EmployeeNumber')
    
    # Calculate Expected Loss score
    # Score = Risk * MonthlyIncome * MONTHS
    df['expected_loss_score'] = df['risk'] * df['MonthlyIncome'] * SALARY_MONTHS_COST
    
    # Sort by Expected Loss
    df_sorted = df.sort_values(by='expected_loss_score', ascending=False)
    
    if len(df_sorted) < 50:
        raise ValueError("Dataset contains fewer than 50 employees.")
    
    top50_cost = df_sorted.head(50).copy()
    top50_cost['rank_by_loss'] = range(1, 51)
    
    out_cols = ['rank_by_loss', 'EmployeeNumber', 'risk', 'MonthlyIncome', 'expected_loss_score']
    
    # Export top 50 by cost
    top50_cost[out_cols].to_csv(config.OUTPUTS_DIR / "top50_by_cost.csv", index=False)
    
    # Calculate overlap with risk-based watchlist
    watchlist_path = config.OUTPUTS_DIR / "watchlist.csv"
    overlap_count = 0
    if watchlist_path.exists():
        wl_df = pd.read_csv(watchlist_path)
        overlap_count = len(set(wl_df['EmployeeNumber']).intersection(set(top50_cost['EmployeeNumber'])))
        
    summary = {
        "assumptions": {
            "months_salary_cost": SALARY_MONTHS_COST,
            "disclaimer": "Scores are relative prioritizations based on class-weighted probabilities. They are NOT guaranteed financial forecasts."
        },
        "overlap_with_risk_top50": overlap_count
    }
    
    with open(config.OUTPUTS_DIR / "expected_loss_summary.json", "w") as f:
        json.dump(summary, f, indent=4)
        
    return summary

if __name__ == "__main__":
    generate_expected_loss()
