# BASE
FROM node:24.13.0-alpine3.23 AS base
WORKDIR /app
# Copy entrypoint (in system dir = Linux convention)
COPY docker/api/entrypoint.prod.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# DEV - with hot reload + run as root for flexibility
# (No `COPY . .`, because it is handled by bind-mount in `docker-compose.dev.yml`)
FROM base AS dev
# install extra tools for dev
RUN apk add --no-cache bash curl
RUN npm install -g @nestjs/cli
# Switch to user node
RUN chown node:node /app
USER node
# install dependencies
COPY --chown=node:node api/package*.json ./
RUN npm install
# run as node user
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# PROD - with assets compilation + run as node user for security
FROM base AS prod
# Security: switch to node user for RUN, ENTRYPOINT and CMD commands
RUN chown -R node:node /app
USER node
# install dependencies
COPY --chown=node:node api/package*.json ./
RUN npm ci
# copy source code as node user
COPY --chown=node:node api/ .
# build dist/ as node user (no bind-mount in docker-compose.prod.yml)
# (the build needs Prisma types to be generated first)
RUN npx prisma generate && npm run build
# run as node user
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
