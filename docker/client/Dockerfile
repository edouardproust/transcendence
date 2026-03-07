# BASE
FROM node:24.13.0-alpine3.23 AS base
WORKDIR /app
# install dependencies
COPY client/package*.json ./

# DEV - runs as root to avoid UID mismatch with bind-mount on 42 school machines
FROM base AS dev
RUN npm install
# No `COPY . .` here (handled by bind-mount in docker-compose.dev.yml)
# --host: listen on all network interfaces (0.0.0.0) so the host machine can access the dev server
CMD ["npm", "run", "dev", "--", "--host"]

# PROD
# -> no prod here: the static files are built in nginx image directly
