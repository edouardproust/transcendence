# ---- VARIABLES ---- #

DOCKER_COMPOSE = docker compose
BACKEND_SERVICE_NAME = api
NGINX_CERTS_PATH = ./nginx/certs


# ---- PHONY ---- #

.PHONY: all up down clean fclean \
	nginx-reload prisma-studio prisma-update prisma-reset


# ---- GENERAL RULES ---- #

all: # default target
	@./setup.sh
	$(DOCKER_COMPOSE) up -d --build

help: # display this help message
	@grep -P '^[\w_-]*:(.*)?( #{1,} [\w .,_-]*)?' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":(.*#+ +)?"}; {printf "%-16s %s\n", $$1, $$2}'

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

clean:
	$(DOCKER_COMPOSE) down -v

fclean:
	-$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	-docker system prune -af --volumes
	rm -f .env
	rm -f $(NGINX_CERTS_PATH)/*.key
	rm -f $(NGINX_CERTS_PATH)/*.crt


# ---- SERVICES RULES ---- #

nginx-reload:
	$(DOCKER_COMPOSE) exec nginx sh -c "nginx -t && nginx -s reload"