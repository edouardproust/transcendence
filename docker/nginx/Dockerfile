# BASE
FROM nginx:stable-alpine3.23 AS base
# delete default config if it exists
RUN rm -f /etc/nginx/conf.d/default.conf

# DEV
FROM base AS dev
COPY docker/nginx/conf/dev.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/ssl/ /etc/nginx/ssl/
CMD ["nginx", "-g", "daemon off;"]

# CLIENT PROD BUILDER (compiling static assets for client)
FROM node:24.13.0-alpine3.23 AS client-prod-builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# PROD
FROM base AS prod
COPY --from=client-prod-builder /app/dist /usr/share/nginx/html
COPY docker/nginx/conf/prod.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/ssl/ /etc/nginx/ssl/
COPY docker/nginx/entrypoint.prod.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]