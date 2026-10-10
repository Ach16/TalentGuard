import pandas as pd
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
