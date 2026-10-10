import json
import joblib
import pandas as pd
import numpy as np
import mlflow
import warnings
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score, average_precision_score

from . import config
from .data import load_data
from .download_data import download_dataset

def precision_at_k(y_true, y_prob, k):
    df = pd.DataFrame({'y': y_true, 'prob': y_prob})
    df = df.sort_values(by='prob', ascending=False)
    top_k = df.head(k)
    return top_k['y'].mean() if len(top_k) > 0 else 0.0

def train_and_evaluate():
    # Try to download data if not present
    if not config.DATASET_PATH.exists():
        download_dataset()

    X, y, employee_ids = load_data()
    base_rate = y.mean()

    df_processed = X.copy()
    df_processed['EmployeeNumber'] = employee_ids
    df_processed['Attrition'] = y
    df_processed.to_csv(config.PROCESSED_DATA_DIR / "employees.csv", index=False)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config.TEST_SIZE, random_state=config.SEED, stratify=y
    )

    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
    categorical_features = X.select_dtypes(include=['object', 'category']).columns

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ],
        remainder='passthrough'
    )

    logreg = Pipeline(steps=[
        ('pre', preprocessor),
        ('clf', LogisticRegression(class_weight='balanced', max_iter=2000, random_state=config.SEED))
    ])

    hgb = Pipeline(steps=[
        ('pre', preprocessor),
        ('clf', HistGradientBoostingClassifier(random_state=config.SEED, max_depth=3, learning_rate=0.05))
    ])

    models = {'logreg': logreg, 'hgb': hgb}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=config.SEED)
    results = {}
    oof_predictions = {}

    mlflow.set_experiment("talentguard")
    
    for name, model in models.items():
        with mlflow.start_run(run_name=name):
            oof_probs = np.zeros(len(X))
            for train_idx, val_idx in cv.split(X, y):
                X_tr, y_tr = X.iloc[train_idx], y.iloc[train_idx]
                X_va = X.iloc[val_idx]
                
                model.fit(X_tr, y_tr)
                oof_probs[val_idx] = model.predict_proba(X_va)[:, 1]
            
            oof_predictions[name] = oof_probs
            
            oof_roc = roc_auc_score(y, oof_probs)
            oof_pr = average_precision_score(y, oof_probs)
            oof_p50 = precision_at_k(y, oof_probs, config.TOP_K)
            
            if oof_roc > 0.95:
                warnings.warn(f"WARNING: Model {name} has exceptionally high OOF ROC-AUC ({oof_roc:.4f}).")
            
            model.fit(X_train, y_train)
            test_probs = model.predict_proba(X_test)[:, 1]
            
            holdout_roc = roc_auc_score(y_test, test_probs)
            holdout_pr = average_precision_score(y_test, test_probs)
            holdout_p50 = precision_at_k(y_test, test_probs, min(config.TOP_K, len(y_test)))
            
            model_path = config.MODELS_DIR / f"model_{name}.joblib"
            joblib.dump(model, model_path)
            
            oof_df = pd.DataFrame({'EmployeeNumber': employee_ids, 'y': y, 'risk': oof_probs})
            oof_path = config.OUTPUTS_DIR / f"oof_scores_{name}.csv"
            oof_df.to_csv(oof_path, index=False)
            
            mlflow.log_params({"model": name, "seed": config.SEED})
            mlflow.log_metrics({
                "oof_roc_auc": oof_roc, "oof_pr_auc": oof_pr, "oof_precision_50": oof_p50,
                "holdout_roc_auc": holdout_roc, "holdout_pr_auc": holdout_pr, "holdout_precision_50": holdout_p50,
                "base_rate": base_rate
            })
            mlflow.log_artifact(model_path)
            mlflow.log_artifact(oof_path)
            
            results[name] = {
                "oof_roc_auc": float(oof_roc), "oof_pr_auc": float(oof_pr), "oof_precision_50": float(oof_p50),
                "holdout_roc_auc": float(holdout_roc), "holdout_pr_auc": float(holdout_pr), "holdout_precision_50": float(holdout_p50)
            }

    selected_model = 'logreg'
    if results['hgb']['oof_pr_auc'] - results['logreg']['oof_pr_auc'] > 0.03:
        selected_model = 'hgb'
    
    pd.DataFrame({'EmployeeNumber': employee_ids, 'y': y, 'risk': oof_predictions[selected_model]}).to_csv(config.OUTPUTS_DIR / "oof_scores.csv", index=False)

    metrics_out = {"selected_model": selected_model, "base_rate": float(base_rate), "models": results}
    with open(config.OUTPUTS_DIR / "metrics.json", "w") as f:
        json.dump(metrics_out, f, indent=4)
        
    print(f"\nTraining Complete. Base Attrition Rate: {base_rate:.2%}")
    print("\nModel Comparison:")
    print(pd.DataFrame(results).T[['oof_roc_auc', 'oof_pr_auc', 'oof_precision_50']].to_markdown())
    print(f"\nSelected Model: {selected_model}")

if __name__ == "__main__":
    train_and_evaluate()
