import os

BASE_DIR = 'talentguard-retention-ai'

files = {
    'requirements.txt': '''pandas
numpy
scikit-learn>=1.2
mlflow
joblib
fastapi
uvicorn
pydantic
kaggle
pytest
''',
    '.gitignore': '''__pycache__/
*.py[cod]
*$py.class
.pytest_cache/
.coverage
htmlcov/
venv/
env/
.env
data/raw/*
!data/raw/.gitkeep
data/processed/*
!data/processed/.gitkeep
outputs/*
!outputs/.gitkeep
models/*
!models/.gitkeep
mlruns/
frontend/node_modules/
frontend/dist/
''',
    'run_all.sh': '''#!/bin/bash
set -e
echo 'Setting up backend...'
python -m venv venv
source venv/Scripts/activate || source venv/bin/activate
pip install -r requirements.txt

echo 'Downloading dataset...'
python -m src.download_data

echo 'Running pipeline...'
python -m src.train

echo 'Running backend tests...'
pytest tests/

echo 'Setting up frontend...'
cd frontend
npm install
npm run build
cd ..

echo 'Run MLflow UI: mlflow ui'
echo 'Run FastAPI: uvicorn api.main:app --reload'
echo 'Run React dev server: cd frontend && npm run dev'
''',
    'README.md': '''# TalentGuard - AI-Powered Employee Retention Intelligence

Stage 1 implementation.

## Setup Instructions

1. **Backend**:
    ```bash
    python -m venv venv
    source venv/Scripts/activate # or venv\\Scripts\\activate on Windows
    pip install -r requirements.txt
    ```

2. **Kaggle Dataset**:
    Ensure you have your `kaggle.json` in `~/.kaggle/` or set `KAGGLE_USERNAME` and `KAGGLE_KEY` environment variables.
    Run `python -m src.download_data`.

3. **Train Models**:
    Run `python -m src.train`

4. **Start API**:
    Run `uvicorn api.main:app --reload`

5. **Start Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
''',
    'AI_USAGE.md': '# AI Usage Guidelines\n\nGuidelines for developing TalentGuard.',
    'docs/architecture.mmd': 'graph TD;\n    A-->B;',
    'docs/results.md': '# Results\n\nResults of the ML models will go here.',
    'src/__init__.py': '',
    'src/config.py': '''from pathlib import Path

# Project paths
ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = ROOT_DIR / "models"
OUTPUTS_DIR = ROOT_DIR / "outputs"

# Create directories if they don't exist
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
(OUTPUTS_DIR / "charts").mkdir(parents=True, exist_ok=True)

# Dataset configuration
DATASET_FILENAME = "WA_Fn-UseC_-HR-Employee-Attrition.csv"
DATASET_PATH = RAW_DATA_DIR / DATASET_FILENAME
KAGGLE_DATASET = "pavansubhasht/ibm-hr-analytics-attrition-dataset"

# Model parameters and constants
SEED = 42
TEST_SIZE = 0.25
TOP_K = 50
MONTHS = 6
SAVE_RATE = 0.20

# Features to drop before modeling
DROP_COLS = ["Attrition", "EmployeeNumber", "EmployeeCount", "StandardHours", "Over18"]

# Optional modules feature flags and configurations (for Stages 2-4)
DEMOGRAPHIC_COLS = ["Age", "Gender", "MaritalStatus"]
CONSTANT_COLS = ["EmployeeCount", "StandardHours", "Over18"]
FEATURE_FLAGS = {
    "ENABLE_EXPLAIN": True,
    "ENABLE_WHATIF": True,
    "ENABLE_REPORT": True,
}
''',
    'src/download_data.py': '''import os
from kaggle.api.kaggle_api_extended import KaggleApi
from . import config

def download_dataset():
    """Downloads dataset from Kaggle if not already present."""
    if config.DATASET_PATH.exists():
        print(f"Dataset already exists at {config.DATASET_PATH}")
        return

    print(f"Downloading dataset {config.KAGGLE_DATASET}...")
    try:
        api = KaggleApi()
        api.authenticate()
        api.dataset_download_files(config.KAGGLE_DATASET, path=config.RAW_DATA_DIR, unzip=True)
        print("Download complete.")
        
        # Verify file exists
        if not config.DATASET_PATH.exists():
            raise FileNotFoundError(f"Expected file {config.DATASET_PATH} not found after download.")
            
    except Exception as e:
        print(f"Failed to download dataset: {e}")
        print(f"Please manually download the dataset from Kaggle and place it at {config.DATASET_PATH}")

if __name__ == "__main__":
    download_dataset()
''',
    'src/data.py': '''import pandas as pd
from typing import Tuple
from . import config

def load_data() -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    if not config.DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at {config.DATASET_PATH}. "
            "Please run 'python -m src.download_data' first."
        )

    df = pd.read_csv(config.DATASET_PATH)

    required_cols = config.DROP_COLS
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    if df.isnull().any().any():
        raise ValueError("Dataset contains missing values.")

    if set(df["Attrition"].unique()) != {"Yes", "No"}:
        raise ValueError("Target column 'Attrition' must contain only 'Yes' or 'No'.")

    if df["EmployeeNumber"].duplicated().any():
        raise ValueError("Dataset contains duplicate EmployeeNumbers.")

    employee_ids = df["EmployeeNumber"].copy()
    y = df["Attrition"].map({"Yes": 1, "No": 0})
    X = df.drop(columns=config.DROP_COLS)

    return X, y, employee_ids
''',
    'src/train.py': '''import json
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
        
    print(f"\\nTraining Complete. Base Attrition Rate: {base_rate:.2%}")
    print("\\nModel Comparison:")
    print(pd.DataFrame(results).T[['oof_roc_auc', 'oof_pr_auc', 'oof_precision_50']].to_markdown())
    print(f"\\nSelected Model: {selected_model}")

if __name__ == "__main__":
    train_and_evaluate()
''',
    'src/explain.py': '"""Stage 2 stub."""\n',
    'src/actions.py': '"""Stage 2 stub."""\n',
    'src/watchlist.py': '"""Stage 3 stub."""\n',
    'src/whatif.py': '"""Stage 3 stub."""\n',
    'src/report.py': '"""Stage 4 stub."""\n',
    'src/extras/__init__.py': '',
    'src/extras/expected_loss.py': '"""Stage 2 stub."""\n',
    'src/extras/fairness.py': '"""Stage 2 stub."""\n',
    'src/extras/hotspots.py': '"""Stage 3 stub."""\n',
    'src/extras/agent.py': '"""Stage 4 stub."""\n',
    'api/__init__.py': '',
    'api/schemas.py': '''from pydantic import BaseModel
from typing import Dict, Any

class HealthResponse(BaseModel):
    status: str
    models_ready: bool
    data_ready: bool

class MetricsResponse(BaseModel):
    selected_model: str
    base_rate: float
    models: Dict[str, Any]
''',
    'api/main.py': '''import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import HealthResponse, MetricsResponse
from src import config

app = FastAPI(title="TalentGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/api/v1/watchlist")
def get_watchlist():
    raise HTTPException(status_code=501, detail="Watchlist not implemented yet (Stage 2).")
''',
    'tests/test_pipeline.py': '''import pytest
import pandas as pd
import numpy as np
import json
from src import config
from src.data import load_data
from src.train import train_and_evaluate
import joblib

@pytest.fixture
def synthetic_data(tmp_path):
    df = pd.DataFrame({
        'EmployeeNumber': range(1, 101),
        'Attrition': ['Yes'] * 20 + ['No'] * 80,
        'Age': np.random.randint(20, 60, 100),
        'DailyRate': np.random.randint(100, 1000, 100),
        'Department': ['Sales', 'Research & Development'] * 50,
        'EmployeeCount': [1] * 100,
        'StandardHours': [80] * 100,
        'Over18': ['Y'] * 100,
        'Gender': ['Male', 'Female'] * 50,
        'MaritalStatus': ['Single', 'Married'] * 50
    })
    
    file_path = tmp_path / "synthetic.csv"
    df.to_csv(file_path, index=False)
    
    orig_path = config.DATASET_PATH
    config.DATASET_PATH = file_path
    yield
    config.DATASET_PATH = orig_path

def test_data_loading(synthetic_data):
    X, y, emp_ids = load_data()
    for col in config.DROP_COLS:
        assert col not in X.columns
    assert len(X) == 100

def test_pipeline(synthetic_data, tmp_path):
    orig_out = config.OUTPUTS_DIR
    orig_mod = config.MODELS_DIR
    orig_proc = config.PROCESSED_DATA_DIR
    
    config.OUTPUTS_DIR = tmp_path / "outputs"
    config.MODELS_DIR = tmp_path / "models"
    config.PROCESSED_DATA_DIR = tmp_path / "processed"
    
    config.OUTPUTS_DIR.mkdir()
    config.MODELS_DIR.mkdir()
    config.PROCESSED_DATA_DIR.mkdir()
    
    try:
        train_and_evaluate()
        assert (config.MODELS_DIR / "model_logreg.joblib").exists()
        assert (config.OUTPUTS_DIR / "metrics.json").exists()
    finally:
        config.OUTPUTS_DIR = orig_out
        config.MODELS_DIR = orig_mod
        config.PROCESSED_DATA_DIR = orig_proc
''',
    'tests/test_api.py': '''from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()

def test_watchlist_not_ready():
    response = client.get("/api/v1/watchlist")
    assert response.status_code == 501
''',
    'data/raw/.gitkeep': '',
    'data/processed/.gitkeep': '',
    'models/.gitkeep': '',
    'outputs/.gitkeep': ''
}

for filepath, content in files.items():
    full_path = os.path.join(BASE_DIR, filepath)
    os.makedirs(os.path.dirname(full_path) or '.', exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Python and bash setup complete.')
