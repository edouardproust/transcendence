# BASE
FROM nginx:stable-alpine3.23 AS base
# delete default config if it exists
RUN rm -f /etc/nginx/conf.d/default.conf

# DEV
FROM base AS dev
COPY ./conf/dev.conf /etc/nginx/conf.d/default.conf
COPY ./ssl/ /etc/nginx/ssl/
CMD ["nginx", "-g", "daemon off;"]

# PROD
FROM nginx:stable-alpine3.23 AS prod
COPY ./conf/prod.conf /etc/nginx/conf.d/default.conf
COPY ./ssl/ /etc/nginx/ssl/
CMD ["nginx", "-g", "daemon off;"]
