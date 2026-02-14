#!/bin/bash
set -e # for security

# Variables
API_PATH="./docker/api"
CLIENT_PATH="./client"
CERT_DIR="./nginx/certs"
title() { echo -e "\033[1;33m$*\033[0m\n"; }
action() { echo -e "\033[1;34m$*\033[0m\n"; }
success() { echo -e "\033[0;32m$*\033[0m\n"; }
error() { echo -e "\033[0;31m$*\033[0m\n"; }

# ----

title "SETUP DEV ENVIRONMENT"

# Root .env file
if [ -f .env ]; then
	success ".env file already exists, skipping creation..."
else
	# Create .env
		action "Creating .env..."
		# prompts
		read -p	"POSTGRES_DB (check.io): " postgres_db
		read -p	"POSTGRES_USER (testuser): " postgres_user
		read -p	"POSTGRES_PASSWORD (testuser123): " postgres_pswd
		echo
		# fields validation
		postgres_db=${postgres_db:-check.io}
		postgres_user=${postgres_user:-testuser}
		postgres_pswd=${postgres_pswd:-testuser123}
		# write file
		printf 'POSTGRES_DB="%s"\nPOSTGRES_USER="%s"\nPOSTGRES_PASSWORD="%s"\n' \
			"$postgres_db" "$postgres_user" "$postgres_pswd" \
			> .env
		success ".env file created"
fi

if [ -f "./nginx/certs/generate-certs.sh" ]; then
	source ./nginx/certs/generate-certs.sh # launch as source to export vars
else
	error "Certificate generation script not found, skipping..."
fi
