FROM node:24.13.0-alpine3.23

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "preview"]