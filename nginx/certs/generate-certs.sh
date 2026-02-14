#!/bin/bash
# CERT_DIR must be defined in the calling script before sourcing this file

if [[ -f "$CERT_DIR/nginx.crt" && -f "$CERT_DIR/nginx.key" ]]; then
	success "SSL certificates already exist, skipping generation..."
else
	mkdir -p "$CERT_DIR"
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout "$CERT_DIR/nginx.key" \
		-out "$CERT_DIR/nginx.crt" \
		-subj "/CN=localhost"
	success "SSL certificates generated"
fi