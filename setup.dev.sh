#!/bin/bash

API_PATH="./docker/api"

info() {
	echo "\033[1;33m$*\033[0m"
}
action() {
	echo "\033[1;34m$*\033[0m"
}
success() {
	echo "\033[1;32m$*\033[0m"
}
error() {
    echo "\033[0;31m$*\033[0m"
}

info "SETUP DEV ENVIRONMENT"

# Root .env file
if [ -f .env ]; then
	success ".env file already exists, skipping creation..."
else
	# Create .env
		action "Creating .env..."
		# prompts
		read -p	"POSTGRES_DB (check.io): " postgres_db
		read -p	"POSTGRES_USER (postgres): " postgres_user
		read -p	"POSTGRES_PASSWORD (postgres): " postgres_pswd
		echo
		# fields validation
		postgres_db=${postgres_db:-check.io}
		postgres_user=${postgres_user:-postgres}
		postgres_pswd=${postgres_pswd:-postgres}
		# write file
		printf 'POSTGRES_DB="%s"\nPOSTGRES_USER="%s"\nPOSTGRES_PASSWORD="%s"\n' \
			"$postgres_db" "$postgres_user" "$postgres_pswd" \
			> .env
		success ".env file created"

	# Create $API_PATH/.env
		action "Creating $API_PATH/.env..."
		printf 'DATABASE_URL="postgresql://%s:%s@localhost:5432/%s?schema=public"\n' \
			"$postgres_user" "$postgres_pswd" "$postgres_db" \
			> $API_PATH/.env
		success "-> $API_PATH/.env file created"
fi

action "Creating Nginx certificates..."
make certs

action "Starting Docker containers..."
make up

# Wait for Postgres
action "Waiting for Postgres to be ready..."
until docker exec tr_postgres pg_isready -U postgres; do
  error "Postgres not ready yet: sleeping 1s..."
  sleep 1
done

# Appliquer les migrations
success "Postgres is ready!"
action "Applying Prisma migrations..."
cd $API_PATH
npx prisma migrate dev

success "Setup success!"
echo "-> Client: https://localhost"
echo "-> API: https://localhost/api"
echo "-> Adminer: https://localhost/adminer"
echo