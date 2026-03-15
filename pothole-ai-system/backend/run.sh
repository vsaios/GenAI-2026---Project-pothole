#!/usr/bin/env bash
cd "$(dirname "$0")"
# Create venv if missing
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi
. .venv/bin/activate
# Export Geoapify key for backend reverse geocoding
export GEOAPIFY_API_KEY="${GEOAPIFY_API_KEY:-e7f7fbc7e44441ce9e2434852b5b4432}"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
