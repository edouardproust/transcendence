# BASE
FROM node:24.13.0-alpine3.23 AS base
WORKDIR /app

# DEV - with hot reload + run as root for flexibility
# (No `COPY . .`, because it is handled by bind-mount in `docker-compose.dev.yml`)
FROM base AS dev
# install extra tools for dev
RUN apk add --no-cache bash git curl
# install dependencies
COPY api/package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli
# Copy entrypoint (in system dir = Linux convention)
COPY docker/api/entrypoint.dev.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
# run as root
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# PROD - with assets compilation + run as node user for security
FROM base AS prod
# Copy entrypoint (in system dir = Linux convention)
COPY docker/api/entrypoint.prod.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
# Security: switch to node user for RUN, ENTRYPOINT and CMD commands
RUN chown -R node:node /app
USER node
# install dependencies
COPY --chown=node:node api/package*.json ./
RUN npm ci
# copy source code as node user
COPY --chown=node:node api/ .
# build dist/ as node user (no bind-mount in docker-compose.prod.yml)
RUN npm run build
# run as node user
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
