#!/bin/bash
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
export PYTHONPATH=.
pytest tests/

echo 'Setting up frontend...'
cd frontend
npm install
npm run build
cd ..

echo 'Run MLflow UI: mlflow ui'
echo 'Run FastAPI: uvicorn api.main:app --reload'
echo 'Run React dev server: cd frontend && npm run dev'
