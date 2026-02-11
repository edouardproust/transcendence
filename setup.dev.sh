#!/bin/bash

API_PATH="./docker/api"

info() { echo "\033[1;33m$*\033[0m"; }
action() { echo "\033[1;34m$*\033[0m"; }
success() { 	echo "\033[1;32m$*\033[0m"; }
error() { echo "\033[0;31m$*\033[0m"; }

info "SETUP DEV ENVIRONMENT"

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

action "Creating Nginx certificates..."
make certs

action "Starting Docker containers..."
make up

success "Setup success!"
echo "-> Client: https://localhost"
echo "-> API: https://localhost/api"
echo "-> Adminer: https://localhost/adminer"
echo