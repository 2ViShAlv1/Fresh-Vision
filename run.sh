#!/usr/bin/env bash
# Fresh Vision — starts the FastAPI backend and the React dev server together.
set -euo pipefail
cd "$(dirname "$0")"

API_PORT="${API_PORT:-8010}"

if [ ! -d frontend/node_modules ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo "Starting API on http://127.0.0.1:${API_PORT} ..."
venv/bin/python3 -m uvicorn backend.main:app --host 127.0.0.1 --port "${API_PORT}" &
API_PID=$!
trap 'kill ${API_PID} 2>/dev/null || true' EXIT

echo "Starting web UI on http://localhost:5180 ..."
cd frontend && npm run dev
