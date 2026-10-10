import pandas as pd
from src import config
from src.data import load_data

def generate_hotspots():
    X, y, emp_ids = load_data()
    oof_df = pd.read_csv(config.OUTPUTS_DIR / "oof_scores.csv")
    watchlist = pd.read_csv(config.OUTPUTS_DIR / "watchlist.csv")
    
    df = X[['Department', 'JobRole']].copy()
    df['EmployeeNumber'] = emp_ids
    df['Attrition'] = y
    df = pd.merge(df, oof_df[['EmployeeNumber', 'risk']], on='EmployeeNumber')
    
    # Flag top 50 watchlist presence
    wl_emp_ids = set(watchlist['EmployeeNumber'])
    df['in_watchlist'] = df['EmployeeNumber'].isin(wl_emp_ids).astype(int)
    
    def analyze_col(col):
        res = df.groupby(col).agg(
            headcount=('EmployeeNumber', 'count'),
            observed_attrition_rate=('Attrition', 'mean'),
            mean_predicted_risk=('risk', 'mean'),
            high_risk_count=('risk', lambda x: (x > 0.5).sum()),
            watchlist_count=('in_watchlist', 'sum')
        ).reset_index()
        return res
        
    dept_hotspots = analyze_col('Department')
    role_hotspots = analyze_col('JobRole')
    
    dept_hotspots.to_csv(config.OUTPUTS_DIR / "department_hotspots.csv", index=False)
    role_hotspots.to_csv(config.OUTPUTS_DIR / "jobrole_hotspots.csv", index=False)
    
if __name__ == "__main__":
    generate_hotspots()
