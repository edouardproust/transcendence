# BASE
FROM node:24.13.0-alpine3.23 AS base

WORKDIR /app

COPY package*.json ./

# DEV
FROM base AS dev

RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]

# PROD
FROM base AS prod

RUN npm ci --only=production

COPY . .

RUN npm run build

CMD ["node", "dist/index.js"]