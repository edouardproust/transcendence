# BASE
FROM node:24.13.0-alpine3.23 AS base

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package*.json ./

# DEV
FROM base AS dev

RUN apk add --no-cache bash git curl

RUN npm install

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# PROD
FROM base AS prod

RUN npm ci --only=production  # Seulement les dépendances de production

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

RUN npm run build

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/index.js"]
