#!/bin/bash
set -e

# Directory for certificates
CERTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../certs" && pwd)"
CA_DIR="$CERTS_DIR/ca"

# Create directories
mkdir -p "$CA_DIR"
mkdir -p "$CERTS_DIR/pwa"
mkdir -p "$CERTS_DIR/mock-api"
mkdir -p "$CERTS_DIR/mock-bt-bridge"

echo "Creating certificates in: $CERTS_DIR"

# Step 1: Generate root CA if it doesn't exist
if [ ! -f "$CA_DIR/ca.key" ]; then
  echo "Generating root CA..."
  
  # Create CA config
  cat > "$CA_DIR/openssl.cnf" << EOF
[req]
distinguished_name = req_distinguished_name
prompt = no
x509_extensions = v3_ca

[req_distinguished_name]
CN = POS Development CA

[v3_ca]
basicConstraints = critical, CA:TRUE
keyUsage = critical, digitalSignature, keyCertSign, cRLSign
EOF

  # Generate CA private key
  openssl genrsa -out "$CA_DIR/ca.key" 2048

  # Generate CA certificate
  openssl req -x509 -new -nodes -key "$CA_DIR/ca.key" \
    -sha256 -days 825 -out "$CA_DIR/ca.pem" \
    -config "$CA_DIR/openssl.cnf"
  
  echo "✅ Root CA certificate generated"
else
  echo "ℹ️ Using existing CA certificate"
fi

# Function to generate certificates signed by our CA
generate_signed_cert() {
  local SERVICE=$1
  local SERVICE_DIR="$CERTS_DIR/$SERVICE"
  
  echo "Generating certificates for $SERVICE..."
  
  # Check if the existing config file exists
  if [ ! -f "$SERVICE_DIR/openssl.cnf" ]; then
    echo "❌ Config file for $SERVICE not found at $SERVICE_DIR/openssl.cnf"
    return 1
  fi
  
  # Generate private key
  openssl genrsa -out "$SERVICE_DIR/key.pem" 2048
  
  # Generate CSR using the existing config
  openssl req -new -key "$SERVICE_DIR/key.pem" \
    -out "$SERVICE_DIR/$SERVICE.csr" \
    -config "$SERVICE_DIR/openssl.cnf"
  
  # Sign the certificate with our CA
  openssl x509 -req -in "$SERVICE_DIR/$SERVICE.csr" \
    -CA "$CA_DIR/ca.pem" -CAkey "$CA_DIR/ca.key" -CAcreateserial \
    -out "$SERVICE_DIR/cert.pem" -days 825 \
    -extfile "$SERVICE_DIR/openssl.cnf" -extensions v3_req
  
  # Cleanup
  rm "$SERVICE_DIR/$SERVICE.csr"
  
  # Copy CA cert to service directory for convenience
  cp "$CA_DIR/ca.pem" "$SERVICE_DIR/ca.pem"
  
  echo "✅ Certificate for $SERVICE generated"
}

# Generate certificates for each service using existing config files
generate_signed_cert "pwa"
generate_signed_cert "mock-api"
generate_signed_cert "mock-bt-bridge"

echo "✅ All certificates generated successfully!"
echo ""
echo "⚠️ IMPORTANT: To trust these certificates on macOS, run:"
echo "sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $CA_DIR/ca.pem"
echo ""
echo "📝 For Chrome service worker support, also run:"
echo "open -a \"Google Chrome\" --args --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://pos.local:3000,https://mock-api.local:5000"
