import json
import pandas as pd
import numpy as np
from src import config
from src.data import load_data
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import cross_val_predict, StratifiedKFold
from sklearn.metrics import roc_auc_score, average_precision_score

def age_band(age):
    if pd.isna(age):
        return "Unknown"
    if 17 <= age <= 30:
        return "17-30"
    if 31 <= age <= 40:
        return "31-40"
    if 41 <= age <= 50:
        return "41-50"
    if 51 <= age <= 61:
        return "51-61"
    return "Other"

def generate_fairness_audit():
    X, y, emp_ids = load_data()
    oof_df = pd.read_csv(config.OUTPUTS_DIR / "oof_scores.csv")
    
    # Merge demographic columns and predictions
    df = X[['Gender', 'MaritalStatus', 'Age']].copy()
    df['EmployeeNumber'] = emp_ids
    df['Attrition'] = y
    df = pd.merge(df, oof_df[['EmployeeNumber', 'risk']], on='EmployeeNumber')
    
    df['AgeBand'] = df['Age'].apply(age_band)
    
    results = {
        "disclaimer": "These results are exploratory diagnostics. They do NOT constitute proof of fairness, causality, or legal compliance. Limitations include small group sizes, proxy variables, and historical label bias.",
        "groups": {}
    }
    
    def analyze_group(col, ref_group):
        stats = {}
        overall_rate = df['Attrition'].mean()
        for group, group_df in df.groupby(col):
            headcount = len(group_df)
            rep_pct = headcount / len(df)
            obs_rate = group_df['Attrition'].mean()
            avg_risk = group_df['risk'].mean()
            
            stats[group] = {
                "headcount": headcount,
                "representation_pct": float(rep_pct),
                "observed_attrition_rate": float(obs_rate),
                "average_predicted_risk": float(avg_risk)
            }
        
        # Calculate representation ratios against reference group
        if ref_group in stats:
            ref_risk = stats[ref_group]["average_predicted_risk"]
            for g in stats:
                stats[g]["risk_ratio_vs_ref"] = float(stats[g]["average_predicted_risk"] / ref_risk) if ref_risk > 0 else 1.0
        
        return stats
        
    results["groups"]["Gender"] = analyze_group("Gender", "Male")
    results["groups"]["MaritalStatus"] = analyze_group("MaritalStatus", "Married")
    results["groups"]["AgeBand"] = analyze_group("AgeBand", "31-40")
    
    # Model comparison (with vs without demographic features)
    demographic_cols = ['Gender', 'MaritalStatus', 'Age']
    X_no_demo = X.drop(columns=demographic_cols)
    
    numeric_features = X_no_demo.select_dtypes(include=['int64', 'float64']).columns
    categorical_features = X_no_demo.select_dtypes(include=['object', 'category']).columns

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ],
        remainder='passthrough'
    )

    logreg_no_demo = Pipeline(steps=[
        ('pre', preprocessor),
        ('clf', LogisticRegression(class_weight='balanced', max_iter=2000, random_state=config.SEED))
    ])
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=config.SEED)
    oof_probs_no_demo = cross_val_predict(logreg_no_demo, X_no_demo, y, cv=cv, method='predict_proba')[:, 1]
    
    roc_auc_no_demo = roc_auc_score(y, oof_probs_no_demo)
    pr_auc_no_demo = average_precision_score(y, oof_probs_no_demo)
    
    # Baseline from metrics
    with open(config.OUTPUTS_DIR / "metrics.json") as f:
        metrics = json.load(f)
        baseline_roc = metrics["models"]["logreg"]["oof_roc_auc"]
        baseline_pr = metrics["models"]["logreg"]["oof_pr_auc"]
        
    results["model_comparison"] = {
        "with_demographics": {
            "roc_auc": float(baseline_roc),
            "pr_auc": float(baseline_pr)
        },
        "without_demographics": {
            "roc_auc": float(roc_auc_no_demo),
            "pr_auc": float(pr_auc_no_demo)
        }
    }
    
    with open(config.OUTPUTS_DIR / "fairness_audit.json", "w") as f:
        json.dump(results, f, indent=4)
        
    return results

if __name__ == "__main__":
    generate_fairness_audit()
