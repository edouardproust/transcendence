#!/bin/bash
# SSL_DIR must be defined in the calling script before sourcing this file

if [[ -d "$SSL_DIR" && -f "$SSL_DIR/nginx.crt" && -f "$SSL_DIR/nginx.key" ]]; then
	success "SSL certificates already exist, skipping generation..."
else
	mkdir -p "$SSL_DIR"
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout "$SSL_DIR/nginx.key" \
		-out "$SSL_DIR/nginx.crt" \
		-subj "/CN=localhost"
	success "SSL certificates generated"
fi
echo