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

title "DOCKER SETUP - PRODUCTION ENVIRONMENT"
echo

# Create .env.prod
action "Creating $ENV_FILE..."

# Prompts
read -p		"DOMAIN_NAME (check.io): " domain_name
read -p		"POSTGRES_DB (checkio_prod): " postgres_db
read -p		"POSTGRES_USER (admin): " postgres_user
	# Fields validation
	domain_name=${domain_name:-"check.io"}
	postgres_db=${postgres_db:-"checkio_prod"}
	postgres_user=${postgres_user:-"admin"}
# Password prompt ()
while true; do
	read -sp	"POSTGRES_PASSWORD: " postgres_pswd
	echo
	# Field validation: not empty and at least 12 characters
	if [ -z "$postgres_pswd" ]; then
		error "Required"
	elif [ ${#postgres_pswd} -lt 12 ]; then
		error "Must be at least 12 characters long"
	else
		break # Password is valid, exit loop
	fi
done
echo
# Generate JWT token (api auth)
	jwt_secret=$(openssl rand -hex 64)
# Write file
printf 'POSTGRES_DB="%s"\nPOSTGRES_USER="%s"\nPOSTGRES_PASSWORD="%s"\nDOMAIN_NAME="%s"\nJWT_SECRET="%s"\nCORS_ORIGIN="https://%s"\n' \
	"$postgres_db" "$postgres_user" "$postgres_pswd" "$domain_name" "$jwt_secret" "$domain_name" \
	> "$ENV_FILE"
# Secure the file (only owner can read/write)
chmod 600 "$ENV_FILE"
success "$ENV_FILE file created and secured (permissions: 600)"

if [ -f "$SSL_GENERATOR" ]; then
	source "$SSL_GENERATOR" # launch as source to export vars
else
	error "Certificate generation script not found, aborting..." >&2
	exit 1
fi

# Additional production checks
echo
action "Running production environment checks..."

# Check if running as root (not recommended for production)
if [ "$EUID" -eq 0 ]; then
	error "WARNING: Running as root is not recommended for production deployments"
	read -p "Continue anyway? (y/N): " continue_root
	if [[ ! "$continue_root" =~ ^[Yy]$ ]]; then
		error "Aborting setup"
		exit 1
	fi
fi

# Remind about backup strategy
action "IMPORTANT REMINDERS FOR PRODUCTION:"
echo "  1. Set up regular database backups"
echo "  2. Configure monitoring and logging"
echo "  3. Review security configurations"
echo "  4. Set up SSL certificates (Let's Encrypt recommended)"
echo "  5. Configure firewall rules"
echo "  6. Review resource limits in docker-compose.prod.yml"
echo

success "Production setup completed successfully!"
echo

echo "Next steps:"
echo "  1. Review $ENV_FILE"
echo "  2. Run: docker compose -f docker/docker-compose.prod.yml up -d"
echo "  3. Check logs: docker compose -f docker/docker-compose.prod.yml logs -f"
echo