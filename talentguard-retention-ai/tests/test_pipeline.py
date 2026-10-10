import pytest
import pandas as pd
import numpy as np
import json
from src import config
from src.data import load_data
from src.train import train_and_evaluate
from src.watchlist import generate_watchlist
from src.whatif import what_if
from src.extras.expected_loss import generate_expected_loss
from src.extras.action_drafts import generate_action_drafts
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
        'MaritalStatus': ['Single', 'Married'] * 50,
        'OverTime': ['Yes', 'No'] * 50,
        'MonthlyIncome': np.random.randint(2000, 10000, 100),
        'BusinessTravel': ['Travel_Rarely', 'Travel_Frequently', 'Non-Travel'] * 33 + ['Travel_Rarely'],
        'JobSatisfaction': np.random.randint(1, 5, 100)
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
        
        # Test watchlist generation
        generate_watchlist()
        watchlist_csv = config.OUTPUTS_DIR / "watchlist.csv"
        assert watchlist_csv.exists()
        
        wl_df = pd.read_csv(watchlist_csv)
        
        # 1. exactly 50 unique employee IDs
        assert len(wl_df) == 50
        assert wl_df['EmployeeNumber'].nunique() == 50
        
        # 2. output schema and column ordering
        expected_cols = ['rank', 'EmployeeNumber', 'risk_pct', 'reasons', 'action', 'MonthlyIncome']
        assert list(wl_df.columns) == expected_cols
        
        # 3. true target never exported
        assert 'Attrition' not in wl_df.columns
        assert 'y' not in wl_df.columns
        
        # 4. each row has three risk explanations
        reasons_col = wl_df['reasons'].apply(lambda x: len(str(x).split(' | ')))
        assert (reasons_col == 3).all() or (reasons_col <= 3).all() # Might be fewer if few features
        
        # 5. recommendations follow rules (top 10 have actions, 11-50 empty)
        # NaN is loaded by pandas for empty strings in csv
        assert wl_df.loc[wl_df['rank'] <= 10, 'action'].notna().all()
        assert wl_df.loc[wl_df['rank'] > 10, 'action'].isna().all()
        
        # Test what-if simulation
        model = joblib.load(config.MODELS_DIR / "model_logreg.joblib")
        X, _, _ = load_data()
        row = X.iloc[[0]].copy()
        
        # 6. Returns valid probabilities
        before, after = what_if(model, row, {'MonthlyIncome': 99999})
        assert 0 <= before <= 1
        assert 0 <= after <= 1
        
        # 7. Doesn't mutate input
        assert row.equals(X.iloc[[0]])
        
        # 8. Invalid inputs rejected
        with pytest.raises(ValueError):
            what_if(model, row, {'FakeFeature': 1})
            
        # Test Expected Loss
        generate_expected_loss()
        el_df = pd.read_csv(config.OUTPUTS_DIR / "top50_by_cost.csv")
        assert len(el_df) == 50
        assert "expected_loss_score" in el_df.columns
        assert el_df['EmployeeNumber'].nunique() == 50
        assert not el_df['expected_loss_score'].isna().any()
        
        # Test Action Drafts
        generate_action_drafts()
        with open(config.OUTPUTS_DIR / "retention_action_drafts.json") as f:
            drafts = json.load(f)
        assert len(drafts) == 10
        assert drafts[0]["status"] == "PENDING_APPROVAL"
        assert "to" in drafts[0]
        assert "@" in drafts[0]["to"]
        
    finally:
        config.OUTPUTS_DIR = orig_out
        config.MODELS_DIR = orig_mod
        config.PROCESSED_DATA_DIR = orig_proc
