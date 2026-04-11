#!/bin/sh
set -e

# Replace DOMAIN_REPLACE by the variable defined in docker-compose.prod.yml
if [ -n "$DOMAIN_NAME" ]; then
	sed "s|DOMAIN_REPLACE|$DOMAIN_NAME|g" \
		/etc/nginx/conf.d/default.conf > /tmp/default.conf && \
	mv /tmp/default.conf /etc/nginx/conf.d/default.conf
else
	echo "'DOMAIN_NAME' variable is not defined. Aborting..." >&2
	exit 1
fi

# Run Dockerfile CMD
exec "$@"
