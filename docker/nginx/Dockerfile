FROM nginx:stable-alpine3.23

# delete defautl config if it exists
RUN rm -f /etc/nginx/conf.d/default.conf

COPY ./conf/dev.conf /etc/nginx/conf.d/default.conf
COPY ./ssl/ /etc/nginx/ssl/

CMD ["nginx", "-g", "daemon off;"]