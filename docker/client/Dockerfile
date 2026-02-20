# BASE
FROM node:24.13.0-alpine3.23 AS base
WORKDIR /app
# security: switch to node user for RUN, ENTRYPOINT and CMD commands
RUN chown -R node:node /app
USER node
# install dependencies
COPY --chown=node:node client/package*.json ./

# DEV
FROM base AS dev
RUN npm install
# No `COPY . .` here (handled by bind-mount in docker-compose.yml)
# run as root (listen on all ports for display in host machine's browser)
CMD ["npm", "run", "dev", "--", "--host"]

# PROD
# -> no prod here: the static files are built in nginx image directly