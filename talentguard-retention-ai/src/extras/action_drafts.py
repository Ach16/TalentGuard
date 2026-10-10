import json
import pandas as pd
from src import config

def generate_action_drafts():
    watchlist_path = config.OUTPUTS_DIR / "watchlist.csv"
    if not watchlist_path.exists():
        raise FileNotFoundError("Watchlist not found. Run generate_watchlist first.")
        
    wl_df = pd.read_csv(watchlist_path)
    
    # Process only top 10
    top10 = wl_df[wl_df['rank'] <= 10].copy()
    
    drafts = []
    for _, row in top10.iterrows():
        # Schema definition
        draft = {
            "employee_id": int(row['EmployeeNumber']),
            "status": "PENDING_APPROVAL",
            "to": f"manager_{row['EmployeeNumber']}@technovasolutions.internal",
            "subject": f"Retention Support Strategy: Employee #{row['EmployeeNumber']}",
            "body": f"Hello,\n\nWe are reaching out to suggest a proactive check-in with Employee #{row['EmployeeNumber']}. Based on aggregate indicators, we'd like to ensure they feel fully supported in their role.\n\nFactors we noted include:\n{row['reasons']}\n\nSuggested Approach:\n{row['action']}\n\nThis is a suggested intervention to support employee success and is not a definitive judgment. Please use your discretion.\n\nBest,\nHR Retention Team",
            "risk_pct": float(row['risk_pct']),
            "reasons": str(row['reasons']),
            "recommended_action": str(row['action'])
        }
        drafts.append(draft)
        
    with open(config.OUTPUTS_DIR / "retention_action_drafts.json", "w") as f:
        json.dump(drafts, f, indent=4)
        
    return drafts

if __name__ == "__main__":
    generate_action_drafts()
