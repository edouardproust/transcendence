# ---- VARIABLES ---- #

ENV_FILE = ./docker/.env
SSL_DIR = ./docker/nginx/ssl

PROD ?= 0
ifeq ($(PROD),1)
DOCKER_COMPOSE = docker compose -f docker/docker-compose.prod.yml
SETUP_SH = ./docker/setup.prod.sh
else
DOCKER_COMPOSE = docker compose -f docker/docker-compose.dev.yml
SETUP_SH = ./docker/setup.dev.sh
endif


# ---- PHONY ---- #

.PHONY: all up down clean fclean nginx-reload client-reload api-reload prisma-studio


# ---- GENERAL TARGETS ---- #

all: # Default target. Rebuild and run all services
	@$(SETUP_SH)
	$(DOCKER_COMPOSE) up -d --build
	@printf "\nServices are available at:\n- App (HTTPS): https://localhost:8443\n- Redirect entrypoint: http://localhost:8080\n- API docs: http://localhost:3000\n- Adminer: http://localhost:8081\n\n"

help: # Display this help message
	@echo "For development: make <target>";
	@echo "For production:  make <target> PROD=1"
	@echo "Targets:";
	@grep -P "^[\w_-]*:(.*)?( #{1,} [\w'.,_-]*)?" $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":(.*#+ +)?"}; {printf " %-16s %s\n", $$1, $$2}'

up: # Start all stopped containers
	$(DOCKER_COMPOSE) up -d

down: # Stop all running containers
	$(DOCKER_COMPOSE) down

logs: # Watch logs of all containers
	$(DOCKER_COMPOSE) logs -f

clean: # Stop all running containers and remove volumes
	$(DOCKER_COMPOSE) down -v

fclean: # Stop all containers, remove volumes and images, and prune system
	-$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	-docker system prune -af --volumes
	rm -f $(ENV_FILE)
	rm -rf $(SSL_DIR)

# ---- SERVICES RULES ---- #

nginx-reload: # Test Nginx configuration and reload nginx if valid
	$(DOCKER_COMPOSE) exec nginx sh -c "nginx -t && nginx -s reload"

prisma-studio: # Dev only: visualize database in the web browser.
	$(DOCKER_COMPOSE) exec api sh -c "npx prisma studio --browser none --port 3030"
