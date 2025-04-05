#!/bin/bash

# Default configuration
MODE=${1:-secure}
HTTPS="false"

# Find the project root
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
echo "Project root: $PROJECT_ROOT"

# Set HTTPS flag based on mode
if [[ "$MODE" == "secure" ]]; then
  HTTPS="true"
  echo "Starting in secure mode (HTTPS/WSS)..."
else
  echo "Starting in standard mode (HTTP/WS)..."
fi

# Check if subdirectories exist
if [[ ! -d "$PROJECT_ROOT/mock-api" ]]; then
  echo "Error: mock-api directory not found at $PROJECT_ROOT/mock-api"
  exit 1
fi

if [[ ! -d "$PROJECT_ROOT/mock-bt-bridge" ]]; then
  echo "Error: mock-bt-bridge directory not found at $PROJECT_ROOT/mock-bt-bridge"
  exit 1
fi

# Start API Mock
echo "Starting API Mock server..."
cd "$PROJECT_ROOT/mock-api" || { echo "Failed to change directory to mock-api"; exit 1; }
if [[ "$HTTPS" == "true" ]]; then
  npm run dev:secure &
else
  npm run dev &
fi
API_PID=$!

# Start BT Bridge
echo "Starting Bluetooth Bridge server..."
cd "$PROJECT_ROOT/mock-bt-bridge" || { echo "Failed to change directory to mock-bt-bridge"; exit 1; }
if [[ "$HTTPS" == "true" ]]; then
  npm run dev:secure &
else
  npm run dev &
fi
BT_PID=$!

# Start React App
echo "Starting React application..."
cd "$PROJECT_ROOT" || { echo "Failed to change directory to project root"; exit 1; }
if [[ "$HTTPS" == "true" ]]; then
  npm run start:secure
else
  npm run start
fi

# Clean up subprocesses when React terminates
kill $API_PID $BT_PID 2>/dev/null
