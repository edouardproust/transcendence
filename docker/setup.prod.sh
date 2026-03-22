#!/bin/bash
set -e # for security

# Variables
env_file="./docker/.env"
SSL_DIR="./docker/nginx/ssl"
ssl_generator="./docker/nginx/generate-ssl.sh"

info() { echo -e "\033[1;33m$*\033[0m"; }
action() { echo -e "\033[1;34m$*\033[0m"; }
success() { echo -e "\033[0;32m$*\033[0m"; }
error() { echo -e "\033[0;31m$*\033[0m"; }

# ----

info "DOCKER SETUP - PRODUCTION ENVIRONMENT"
echo

action "Creating $env_file..."

# Prompts
read -p "DOMAIN_NAME (check.io): " domain_name
domain_name=${domain_name:-"check.io"}
read -p "POSTGRES_DB (checkio_prod): " postgres_db
postgres_db=${postgres_db:-"checkio_prod"}
<<<<<<< HEAD
postgres_user_default=$(openssl rand -hex 6)
read -p "POSTGRES_USER (${postgres_user_default}): " postgres_user
postgres_user=${postgres_user:-$postgres_user_default}
while true; do
    read -sp "POSTGRES_PASSWORD: " postgres_pswd
    echo
    if [ -z "$postgres_pswd" ]; then
        error "Required"
    elif [ ${#postgres_pswd} -lt 16 ]; then
        error "Must be at least 16 characters long"
    elif ! echo "$postgres_pswd" | grep -qP '[A-Z]'; then
        error "Must contain at least one uppercase letter"
    elif ! echo "$postgres_pswd" | grep -qP '[a-z]'; then
        error "Must contain at least one lowercase letter"
    elif ! echo "$postgres_pswd" | grep -qP '[0-9]'; then
        error "Must contain at least one number"
    elif ! echo "$postgres_pswd" | grep -qP '[^a-zA-Z0-9]'; then
        error "Must contain at least one special character"
    else
        break
    fi
done
while true; do
    read -p "AWS_ACCESS_KEY_ID: " aws_access_key_id
    [ -n "$aws_access_key_id" ] && break
    error "Required"
done

while true; do
    read -sp "AWS_SECRET_ACCESS_KEY: " aws_secret_access_key
    echo
    [ -n "$aws_secret_access_key" ] && break
    error "Required"
done
read -p "AWS_REGION (eu-west-3): " aws_region
aws_region=${aws_region:-"eu-west-3"}
read -p "S3_BUCKET (checkio-uploads): " s3_bucket
s3_bucket=${s3_bucket:-"checkio-uploads"}
=======
read -p "POSTGRES_USER (admin): " postgres_user
postgres_user=${postgres_user:-"admin"}
while true; do
	read -sp "POSTGRES_PASSWORD: " postgres_pswd
	echo
	# Validation: not empty and at least 12 characters
	if [ -z "$postgres_pswd" ]; then
		error "Required"
	elif [ ${#postgres_pswd} -lt 12 ]; then
		error "Must be at least 12 characters long"
	else
		break # Password is valid, exit loop
	fi
done
echo
read -p "AWS_ACCESS_KEY_ID: " aws_access_key_id
read -sp "AWS_SECRET_ACCESS_KEY: " aws_secret_access_key
echo
read -p "AWS_REGION (eu-west-3): " aws_region
aws_region=${aws_region:-"eu-west-3"}
read -p "S3_BUCKET: " s3_bucket
>>>>>>> 2917ba2 (added users avatars upload + minio docker container)

# Generate JWT token (api auth)
	jwt_secret=$(openssl rand -hex 64)

# Write file
printf 'POSTGRES_DB="%s"\nPOSTGRES_USER="%s"\nPOSTGRES_PASSWORD="%s"\nDOMAIN_NAME="%s"\nJWT_SECRET="%s"\nCORS_ORIGIN="https://%s"\nAWS_ACCESS_KEY_ID="%s"\nAWS_SECRET_ACCESS_KEY="%s"\nAWS_REGION="%s"\nS3_BUCKET="%s"\n' \
    "$postgres_db" "$postgres_user" "$postgres_pswd" "$domain_name" "$jwt_secret" "$domain_name" \
    "$aws_access_key_id" "$aws_secret_access_key" "$aws_region" "$s3_bucket" \
    > "$env_file"

# Secure the file (only owner can read/write)
chmod 600 "$env_file"
success "$env_file file created and secured (permissions: 600)"
<<<<<<< HEAD
echo
=======
>>>>>>> 2917ba2 (added users avatars upload + minio docker container)

if [ -f "$ssl_generator" ]; then
	source "$ssl_generator" # launch as source to export vars
else
	error "Certificate generation script not found, aborting..." >&2
	exit 1
fi

# Additional production checks
	# Check if running as root (not recommended for production)
	if [ "$EUID" -eq 0 ]; then
		error "WARNING: Running as root is not recommended for production deployments"
		read -p "Continue anyway? (y/N): " continue_root
		if [[ ! "$continue_root" =~ ^[Yy]$ ]]; then
			error "Aborting setup"
			exit 1
		fi
		echo
	fi

# Remind about backup strategy
success "Production setup completed successfully!"
echo

info "Next steps:"
echo "  1. Review $env_file"
echo "  2. Check logs: make logs PROD=1"
echo

info "Important reminders for production:"
echo "  1. Set up regular database backups"
echo "  2. Configure monitoring and logging"
echo "  3. Review security configurations"
echo "  4. Set up SSL certificates (Let's Encrypt recommended)"
echo "  5. Configure firewall rules"
echo "  6. Review resource limits in docker-compose.prod.yml"
<<<<<<< HEAD
=======
echo

success "Production setup completed successfully!"
echo

echo "Next steps:"
echo "  1. Review $env_file"
echo "  2. Run: docker compose -f docker/docker-compose.prod.yml up -d"
echo "  3. Check logs: docker compose -f docker/docker-compose.prod.yml logs -f"
>>>>>>> 2917ba2 (added users avatars upload + minio docker container)
echo