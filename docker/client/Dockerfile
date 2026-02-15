# BASE
FROM node:24.13.0-alpine3.23 AS base
WORKDIR /app

# DEV
FROM base AS dev
# install extra tools for dev
RUN apk add --no-cache bash git curl
# install dependencies (as root for flexibilty)
COPY client/package*.json ./
RUN npm install
# No `COPY . .` here (handled by bind-mount in docker-compose.yml)
# run as root (listen on all ports for display in host machine's browser)
CMD ["npm", "run", "dev", "--", "--host"]


# BUILDER (compiling assets for prod in a temp container)
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# PROD
FROM base AS prod
# security: switch to node user for RUN, ENTRYPOINT and CMD commands
USER node
# install dependencies
COPY client/package*.json ./
RUN npm ci --only=production
# copy source code as node user (for security)
COPY --chown=node:node client/ .
# build dist/
RUN npm run build
# run as node user (for security)
CMD ["node", "dist/index.js"]