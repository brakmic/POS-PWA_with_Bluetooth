#!/bin/bash

# Default configuration
USE_HTTPS=false
API_PORT=5000
BT_PORT=3030
REACT_PORT=3000

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --secure)
      USE_HTTPS=true
      ;;
    --api-port=*)
      API_PORT="${1#*=}"
      ;;
    --bt-port=*)
      BT_PORT="${1#*=}"
      ;;
    --react-port=*)
      REACT_PORT="${1#*=}"
      ;;
    *)
      echo "Unknown parameter: $1"
      exit 1
      ;;
  esac
  shift
done

# Check if certificates exist, generate if needed
if [ "$USE_HTTPS" = true ]; then
  if [ ! -f "./certs/pwa/cert.pem" ]; then
    echo "Certificates not found. Generating..."
    ./scripts/setup-certs.sh
  fi
fi

# Create .env.development for React
cat > .env.development << EOF
REACT_APP_API_URL=${USE_HTTPS:+https://localhost:$API_PORT}${USE_HTTPS:-http://localhost:$API_PORT}
REACT_APP_MOCK_BLUETOOTH_URL=${USE_HTTPS:+wss://localhost:$BT_PORT}${USE_HTTPS:-ws://localhost:$BT_PORT}
PUBLIC_URL=${USE_HTTPS:+https://localhost:$REACT_PORT}${USE_HTTPS:-http://localhost:$REACT_PORT}
REACT_APP_ENABLE_SW=true
EOF

# Start all components
echo "Setting up the development environment..."

# Start in separate terminals using appropriate command for your environment
if [ "$USE_HTTPS" = true ]; then
  echo "API Mock: cd mock-api && npm run dev:secure"
  echo "BT Bridge Mock: cd mock-bt-bridge && npm run dev:secure"
  echo "React App: npm run start:secure"
else
  echo "API Mock: cd mock-api && npm run dev"
  echo "BT Bridge Mock: cd mock-bt-bridge && npm run dev"
  echo "React App: npm run start"
fi

echo "Development environment configured!"