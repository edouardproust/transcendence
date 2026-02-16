#!/bin/bash
set -e # for security

# Variables
ENV_FILE="./docker/.env"
SSL_DIR="./docker/nginx/ssl"
SSL_GENERATOR="./docker/nginx/generate-ssl.sh"
title() { echo -e "\033[1;33m$*\033[0m"; }
action() { echo -e "\033[1;34m$*\033[0m"; }
success() { echo -e "\033[0;32m$*\033[0m"; }
error() { echo -e "\033[0;31m$*\033[0m"; }

# ----

title "DOCKER SETUP - DEV ENVIRONMENT"
echo

# Root .env file
if [ -f $ENV_FILE ]; then
	success "$ENV_FILE file already exists, skipping creation..."
else
	# Create .env
		action "Creating $ENV_FILE..."
		# prompts
		read -p		"POSTGRES_DB (check.io): " postgres_db
		read -p		"POSTGRES_USER (testuser): " postgres_user
		read -sp	"POSTGRES_PASSWORD (testuser123): " postgres_pswd
		echo
		# Validate fields
			# Default values
			postgres_db=${postgres_db:-check.io}
			postgres_user=${postgres_user:-testuser}
			postgres_pswd=${postgres_pswd:-testuser123}
		# Write file
		printf 'POSTGRES_DB="%s"\nPOSTGRES_USER="%s"\nPOSTGRES_PASSWORD="%s"\n' \
			"$postgres_db" "$postgres_user" "$postgres_pswd" \
			> $ENV_FILE
		success "$ENV_FILE file created"
fi

if [ -f "$SSL_GENERATOR" ]; then
	source $SSL_GENERATOR # launch as source to export vars
else
	error "Certificate generation script not found, aborting..." >&2
	exit 1
fi
