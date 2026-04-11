#!/bin/sh

# Set database using Prisma
# (postgres healthcheck in docker-compose.yml ensures that database is ready before running the following commands)
npx prisma generate # Generating Prisma Client
npx prisma migrate dev --name init # Applying Prisma migrations to dev db
DATABASE_URL=$DATABASE_TEST_URL npx prisma migrate deploy # Applying Prisma migrations to e2e_tests db

# Launch command passed as argument (e.g. npm run dev)
exec "$@"