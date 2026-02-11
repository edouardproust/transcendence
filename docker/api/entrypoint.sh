#!/bin/sh
# entrypoint.sh

until pg_isready -h postgres -U $POSTGRES_USER; do
  echo "Waiting for Postgres..."
  sleep 1
done

echo "Applying Prisma migrations..."
npx prisma migrate dev	# 'dev' if dev, 'deploy' if prod

exec npm run start:dev