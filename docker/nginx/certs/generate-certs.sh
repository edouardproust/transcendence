#!/bin/bash
CERT_DIR="./docker/nginx/certs"

if [ ! -f "$CERT_DIR/nginx.crt" ]; then
	mkdir -p "$CERT_DIR"
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout "$CERT_DIR/nginx.key" \
		-out "$CERT_DIR/nginx.crt" \
		-subj "/CN=localhost"
	echo "✅ SSL certificates generated"
fi