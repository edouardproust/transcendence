#!/bin/bash
set -e # for security

# Variables
ENV_FILE="./docker/.env"
SSL_DIR="./docker/nginx/ssl"
SSL_GENERATOR="./docker/nginx/generate-ssl.sh"
REQUIRED_VARS=(PROJECT_NAME POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET CORS_ORIGIN)
DEV_HTTP_ORIGIN="http://localhost:8080"
DEV_HTTPS_ORIGIN="https://localhost:8443"
DEV_CORS_ORIGIN="${DEV_HTTP_ORIGIN},${DEV_HTTPS_ORIGIN}"

title() { echo -e "\033[1;33m$*\033[0m"; }
action() { echo -e "\033[1;34m$*\033[0m"; }
success() { echo -e "\033[0;32m$*\033[0m"; }
error() { echo -e "\033[0;31m$*\033[0m"; }

env_is_complete() {
    [ -f "$ENV_FILE" ] || return 1
    for var in "${REQUIRED_VARS[@]}"; do
        grep -q "^${var}=" "$ENV_FILE" || return 1
    done
    return 0
}

sync_dev_cors_origin() {
	[ -f "$ENV_FILE" ] || return 0

	current_cors_origin=$(grep '^CORS_ORIGIN=' "$ENV_FILE" | head -n 1 | cut -d= -f2- | tr -d '"')
	if [ "$current_cors_origin" != "$DEV_CORS_ORIGIN" ]; then
		action "Updating CORS_ORIGIN in $ENV_FILE..."
		sed -i "s#^CORS_ORIGIN=.*#CORS_ORIGIN=\"${DEV_CORS_ORIGIN}\"#" "$ENV_FILE"
		success "CORS_ORIGIN updated to support ${DEV_HTTP_ORIGIN} and ${DEV_HTTPS_ORIGIN}"
	fi
}

# ----

title "DOCKER SETUP - DEV ENVIRONMENT"
echo

# Root .env file
if env_is_complete; then
	success "$ENV_FILE file already exists, skipping creation..."
	sync_dev_cors_origin
else
	# Create .env
		action "Creating $ENV_FILE..."
		# prompts
		read -p		"PROJECT_NAME (Check.io): " project_name
		read -p		"POSTGRES_DB (check.io): " postgres_db
		read -p		"POSTGRES_USER (testuser): " postgres_user
		read -sp	"POSTGRES_PASSWORD (testuser123): " postgres_pswd
		echo
		# Validate fields
			# Default values
			project_name=${project_name:-"Check.io"}
			postgres_db=${postgres_db:-"check.io"}
			postgres_user=${postgres_user:-"testuser"}
			postgres_pswd=${postgres_pswd:-"testuser123"}
		# Generate JWT secret (api auth)
			JWT_SECRET=$(openssl rand -hex 64)
		# Write file
			printf 'PROJECT_NAME="%s"\nPOSTGRES_DB="%s"\nPOSTGRES_USER="%s"\nPOSTGRES_PASSWORD="%s"\nJWT_SECRET="%s"\nCORS_ORIGIN="%s"\n' \
				"$project_name" "$postgres_db" "$postgres_user" "$postgres_pswd" "$JWT_SECRET" "$DEV_CORS_ORIGIN" \
				> $ENV_FILE
		success "$ENV_FILE file created"
fi
echo

if [ -f "$SSL_GENERATOR" ]; then
	source $SSL_GENERATOR # launch as source to export vars
else
	error "Certificate generation script not found, aborting..." >&2
	exit 1
fi
