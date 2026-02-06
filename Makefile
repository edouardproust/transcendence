DOCKER_COMPOSE = docker compose -f ./docker-compose.yml

# RULES

all: up

up:
	$(DOCKER_COMPOSE) up -d

logs:
	$(DOCKER_COMPOSE) logs

down:
	$(DOCKER_COMPOSE) down

clean:
	$(DOCKER_COMPOSE) down -v
	docker system prune -af

re: clean all