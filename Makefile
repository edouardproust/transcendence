DOCKER_COMPOSE_DEV = docker compose -f docker-compose.dev.yml

.PHONY: all setup certs up rebuild down clean fclean logs ps restart nginx postgres

all: setup up

setup:
	@sh setup.dev.sh

certs:
	sh ./docker/nginx/certs/generate-certs.sh

up:
	$(DOCKER_COMPOSE_DEV) up -d

rebuild:
	$(DOCKER_COMPOSE_DEV) up -d --build

down:
	$(DOCKER_COMPOSE_DEV) down

clean:
	$(DOCKER_COMPOSE_DEV) down -v

fclean:
	$(DOCKER_COMPOSE_DEV) down -v --rmi all
	docker system prune -f

logs:
	$(DOCKER_COMPOSE_DEV) logs -f

ps:
	$(DOCKER_COMPOSE_DEV) ps

restart:
	$(DOCKER_COMPOSE_DEV) restart

nginx:
	$(DOCKER_COMPOSE_DEV) exec nginx sh -c "nginx -t && nginx -s reload"
