import os
from . import config

def download_dataset():
    """Downloads dataset from Kaggle if not already present."""
    if config.DATASET_PATH.exists():
        print(f"Dataset already exists at {config.DATASET_PATH}")
        return

    print(f"Downloading dataset {config.KAGGLE_DATASET}...")
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
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
