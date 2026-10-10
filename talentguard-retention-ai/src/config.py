from pathlib import Path

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
