DOCKER_COMPOSE_DEV = docker compose -f docker-compose.dev.yml
API_PATH = ./docker/api

.PHONY: all help setup certs up rebuild down clean fclean re logs ps restart db-reset db-migrate db-generate nginx-reload postgres

all: setup up # default target

help: # display this help message
	@grep -E '^[a-z-]*:(.*)? #{1,} [a-zA-Z ,-]*' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*# "}; {printf "%-15s %s\n", $$1, $$2}'

setup: # setup the development environment
	@sh setup.dev.sh

certs: # generate self-signed certificates for Nginx
	sh ./docker/nginx/certs/generate-certs.sh

up: # start the development environment
	$(DOCKER_COMPOSE_DEV) up -d

rebuild: # rebuild and start the development environment
	$(DOCKER_COMPOSE_DEV) up -d --build

down: # stop the development environment
	$(DOCKER_COMPOSE_DEV) down

clean: # stop the development environment and remove volumes
	$(DOCKER_COMPOSE_DEV) down -v

fclean: # stop the development environment, remove volumes and images, and prune system
	$(DOCKER_COMPOSE_DEV) down -v --rmi all
	docker system prune -f

re: fclean # stop the development environment, remove volumes and images, prune system, and start fresh
	rm -f .env $(API_PATH)/.env
	make all

logs: # view logs of the development environment
	$(DOCKER_COMPOSE_DEV) logs -f

ps: # list running containers of the development environment
	$(DOCKER_COMPOSE_DEV) ps

restart: # restart the development environment
	$(DOCKER_COMPOSE_DEV) restart

db-reset: # reset the database by dropping all data and reapplying migrations
	$(DOCKER_COMPOSE_DEV) exec api sh -c "npx prisma migrate reset"

db-migrate: # apply database migrations
	$(DOCKER_COMPOSE_DEV) exec api sh -c "npx prisma migrate dev"

db-generate: # generate Prisma client based on the schema
	$(DOCKER_COMPOSE_DEV) exec api sh -c "npx prisma generate"

nginx-reload: # test Nginx configuration and reload if valid
	$(DOCKER_COMPOSE_DEV) exec nginx sh -c "nginx -t && nginx -s reload"
