#!/bin/sh
set -e
cd /app/backend
echo "Running Alembic migrations..."
python -m alembic upgrade head
echo "Starting API..."
exec python -m uvicorn main:app --host 0.0.0.0 --port 8000
