#!/bin/bash
set -e # for security

# Variables
env_file="./docker/.env"
SSL_DIR="./docker/nginx/ssl"
ssl_generator="./docker/nginx/generate-ssl.sh"
required_vars=(PROJECT_NAME POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET CORS_ORIGIN AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION S3_BUCKET S3_ENDPOINT S3_PUBLIC_URL)

project_name=${project_name:-"Checkio"}
postgres_db=${postgres_db:-"checkio"}
postgres_user=${postgres_user:-"testuser"}
postgres_pswd=${postgres_pswd:-"testuser123"}
aws_access_key_id="minioadmin"
aws_secret_access_key="minioadmin123"
aws_region="eu-west-3"
s3_bucket="checkio-uploads"
s3_endpoint="http://minio:9000"       # Used by minIO SDK to upload into Docker container
s3_public_url="http://localhost:9000" # Used to build the file public URL (accessible by frontend)
dev_http_origin="http://localhost:8080"
dev_https_origin="https://localhost:8443"
vite_socket_url="wss://localhost:8443"
dev_cors_origin="${dev_http_origin},${dev_https_origin}"

info() { echo -e "\033[1;33m$*\033[0m"; }
success() { echo -e "\033[0;32m$*\033[0m"; }
error() { echo -e "\033[0;31m$*\033[0m"; }

env_is_complete() {
  [ -f "$env_file" ] || return 1
  for var in "${required_vars[@]}"; do
    grep -q "^${var}=" "$env_file" || return 1
  done
  return 0
}

sync_dev_cors_origin() {
  [ -f "$env_file" ] || return 0

  current_cors_origin=$(grep '^CORS_ORIGIN=' "$env_file" | head -n 1 | cut -d= -f2- | tr -d '"')
  if [ "$current_cors_origin" != "$dev_cors_origin" ]; then
    sed -i "s#^CORS_ORIGIN=.*#CORS_ORIGIN=\"${dev_cors_origin}\"#" "$env_file"
    success "CORS_ORIGIN updated to support ${dev_http_origin} and ${dev_https_origin}"
  fi
}

# ----

info "DOCKER SETUP - DEV ENVIRONMENT"
echo

if env_is_complete; then
  success "$env_file file already exists, skipping creation..."
  sync_dev_cors_origin
else
  jwt_secret=$(openssl rand -hex 64)

  printf 'PROJECT_NAME="%s"\nPOSTGRES_DB="%s"\nPOSTGRES_USER="%s"\nPOSTGRES_PASSWORD="%s"\nJWT_SECRET="%s"\nCORS_ORIGIN="%s"\nAWS_ACCESS_KEY_ID="%s"\nAWS_SECRET_ACCESS_KEY="%s"\nAWS_REGION="%s"\nS3_BUCKET="%s"\nS3_ENDPOINT="%s"\nS3_PUBLIC_URL="%s"\nVITE_SOCKET_URL="%s"\n' \
    "$project_name" "$postgres_db" "$postgres_user" "$postgres_pswd" "$jwt_secret" "$dev_cors_origin" \
    "$aws_access_key_id" "$aws_secret_access_key" "$aws_region" "$s3_bucket" "$s3_endpoint" "$s3_public_url" "$vite_socket_url" \
    >$env_file

  success "$env_file file created"
fi
echo

if [ -f "$ssl_generator" ]; then
  source $ssl_generator # launch as source to export vars
else
  error "Certificate generation script not found, aborting..." >&2
  exit 1
fi
