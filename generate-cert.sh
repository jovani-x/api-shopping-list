#!/bin/bash

# Create the certs directory if it doesn't exist
mkdir -p certs

# Generate a private key
openssl genrsa -out certs/server.key 2048

# Generate a certificate signing request
openssl req -new -key certs/server.key -out certs/server.csr -subj "/CN=localhost"

# Generate a self-signed certificate
openssl x509 -req -days 365 -in certs/server.csr -signkey certs/server.key -out certs/server.crt
