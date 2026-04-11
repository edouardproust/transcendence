#!/bin/bash
set -e

env_file="./docker/.env"
SSL_DIR="./docker/nginx/ssl"
ssl_generator="./docker/nginx/generate-ssl.sh"

info()    { echo -e "\033[1;33m$*\033[0m"; }
action()  { echo -e "\033[1;34m$*\033[0m"; }
success() { echo -e "\033[0;32m$*\033[0m"; }
error()   { echo -e "\033[0;31m$*\033[0m"; }

validate_strength() {
  local val="$1"
  if [ -z "$val" ]; then
    error "Required"
    return 1
  elif [ ${#val} -lt 16 ]; then
    error "Must be at least 16 characters long"
    return 1
  elif ! echo "$val" | grep -qP '[A-Z]'; then
    error "Must contain at least one uppercase letter"
    return 1
  elif ! echo "$val" | grep -qP '[a-z]'; then
    error "Must contain at least one lowercase letter"
    return 1
  elif ! echo "$val" | grep -qP '[0-9]'; then
    error "Must contain at least one number"
    return 1
  elif ! echo "$val" | grep -qP '[^a-zA-Z0-9]'; then
    error "Must contain at least one special character"
    return 1
  fi
  return 0
}

prompt_secure() {
  local label="$1"
  local result_var="$2"
  local val

  while true; do
    read -sp "$label: " val
    echo
    validate_strength "$val" && break
  done

  printf -v "$result_var" '%s' "$val"
}

# ----
info "DOCKER SETUP - PRODUCTION ENVIRONMENT"
echo

action "Creating $env_file..."

read -p "DOMAIN_NAME (check.io): " domain_name
domain_name=${domain_name:-"check.io"}

read -p "POSTGRES_DB (checkio_prod): " postgres_db
postgres_db=${postgres_db:-"checkio_prod"}

postgres_user_default=$(openssl rand -hex 6)
read -p "POSTGRES_USER (${postgres_user_default}): " postgres_user
postgres_user=${postgres_user:-$postgres_user_default}

prompt_secure "POSTGRES_PASSWORD" postgres_pswd

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

prompt_secure "SEED_ADMIN_PASSWORD" seed_admin_pswd

jwt_secret=$(openssl rand -hex 64)

printf 'POSTGRES_DB="%s"\nPOSTGRES_USER="%s"\nPOSTGRES_PASSWORD="%s"\nDOMAIN_NAME="%s"\nJWT_SECRET="%s"\nCORS_ORIGIN="https://%s"\nAWS_ACCESS_KEY_ID="%s"\nAWS_SECRET_ACCESS_KEY="%s"\nAWS_REGION="%s"\nS3_BUCKET="%s"\nSEED_ADMIN_PASSWORD="%s"\nVITE_SOCKET_URL="https://%s"\n' \
"$postgres_db" "$postgres_user" "$postgres_pswd" "$domain_name" "$jwt_secret" "$domain_name" \
"$aws_access_key_id" "$aws_secret_access_key" "$aws_region" "$s3_bucket" \
"$seed_admin_pswd" "$domain_name" \
> "$env_file"

chmod 600 "$env_file"
success "$env_file file created and secured (permissions: 600)"
echo

if [ -f "$ssl_generator" ]; then
  source "$ssl_generator"
else
  error "Certificate generation script not found, aborting..." >&2
  exit 1
fi

if [ "$EUID" -eq 0 ]; then
  error "WARNING: Running as root is not recommended for production deployments"
  read -p "Continue anyway? (y/N): " continue_root
  if [[ ! "$continue_root" =~ ^[Yy]$ ]]; then
    error "Aborting setup"
    exit 1
  fi
  echo
fi

success "Production setup completed successfully!"
echo
info "Next steps:"
echo "  1. Review $env_file"
echo "  2. Run: make seed (to initialize the admin account)"
echo "  3. Check logs: make logs PROD=1"
echo
info "Important reminders for production:"
echo "  1. Set up regular database backups"
echo "  2. Configure monitoring and logging"
echo "  3. Review security configurations"
echo "  4. Set up SSL certificates (Let's Encrypt recommended)"
echo "  5. Configure firewall rules"
echo "  6. Review resource limits in docker-compose.prod.yml"
echo