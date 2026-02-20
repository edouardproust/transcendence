#!/bin/sh
set -e

# Replace DOMAIN_REPLACE by the variable defined in docker-compose.prod.yml
if [ -n "$DOMAIN_NAME" ]; then
	awk '{gsub(/DOMAIN_REPLACE/,"'"$DOMAIN_NAME"'")}1' \
		/etc/nginx/conf.d/default.conf > /tmp/default.conf && \
	mv /tmp/default.conf /etc/nginx/conf.d/default.conf
else
	echo "'DOMAIN_NAME' varible is not defined in docker-compose.prod.yml. Aborting..." >&2
	exit 1
fi

# Run Dockerfile CMD
exec "$@"
