#!/bin/bash

# Create .cert directory if it doesn't exist
mkdir -p .cert

# Generate self-signed certificate for local development
openssl req -x509 \
  -newkey rsa:2048 \
  -keyout .cert/key.pem \
  -out .cert/cert.pem \
  -days 365 \
  -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Development/CN=localhost"

# Set appropriate permissions
chmod 600 .cert/key.pem
chmod 600 .cert/cert.pem

echo "SSL certificates generated successfully in .cert directory"
echo "You may need to add these certificates to your system's trusted certificates"
echo "To start the development server with HTTPS, run: npm run dev"
