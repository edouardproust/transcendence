#!/bin/sh

# Set database using Prisma
# (postgres healthcheck in docker-compose.yml ensures that database is ready before running the following commands)
npx prisma generate # Generating Prisma Client
npx prisma migrate dev --name init # Applying Prisma migrations

# Launch command passed as argument (e.g. npm run dev)
exec "$@"