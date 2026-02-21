#!/usr/bin/env bash
# Kill processes on 3000 and 8000, then start backend (8000) and frontend (3000).

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

kill_port() {
  local port=$1
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -ti ":$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "Killing process(es) on port $port: $pids"
      echo "$pids" | xargs kill -9 2>/dev/null || true
      sleep 1
    fi
  fi
}

echo "Stopping anything on 8000 and 3000..."
kill_port 8000
kill_port 3000

cleanup() {
  echo "Stopping backend and frontend..."
  [ -n "$BACKEND_PID" ] && kill -9 "$BACKEND_PID" 2>/dev/null || true
  kill_port 8000
  kill_port 3000
  exit 0
}
trap cleanup INT TERM

echo "Starting backend on http://localhost:8000 ..."
cd "$BACKEND"
uv run uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 2
echo "Starting frontend on http://localhost:3000 ..."
cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

echo "Backend: http://localhost:8000  Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both."
wait
