#!/bin/sh

# Generating Prisma Client (waiting for Postgres to be ready)
until pg_isready -h postgres -U $POSTGRES_USER; do
  echo "Waiting for Postgres..."
  sleep 1
done
npx prisma generate

#Applying Prisma migrations
npx prisma migrate dev	# 'dev' if dev, 'deploy' if prod

# Launch command passed as argument (e.g. npm run dev)
exec "$@"