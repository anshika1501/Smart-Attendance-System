@echo off
echo Starting FastAPI server...
call venv\Scripts\activate.bat
uvicorn main:app --reload --port 8000
