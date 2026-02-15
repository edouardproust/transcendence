# BASE
FROM node:24.13.0-alpine3.23 AS base
# Copy entrypoint
COPY docker/api/entrypoint.sh /
WORKDIR /app
RUN apk add --no-cache postgresql-client

# DEV - with hot reload + run as root for flexibility
# (No `COPY . .`, because it is handled by bind-mount in `docker-compose.yml`)
FROM base AS dev
# install extra tools for dev
RUN apk add --no-cache bash git curl

# install dependencies
COPY api/package*.json ./
RUN npm install
# run as root
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# PROD - with assets compilation + run as node user for security
FROM base AS prod
# security: switch to node user for RUN, ENTRYPOINT and CMD commands
USER node
# install dependencies
RUN npm ci --only=production
# copy source code as node user
COPY --chown=node:node api/ .
# build dist/ as node user
RUN npm run build
# run as node users
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/index.js"]
