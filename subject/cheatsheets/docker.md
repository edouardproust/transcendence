# Docker Cheatsheet

## Images

| Command                                                    | Description                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `docker images`                                            | List local images                                                       |
| `docker build -t <image-name> <path-to-dockerfile-folder>` | Build an Image from a Dockerfile located in `path-to-dockerfile-folder` |
| `docker rmi <image-name>`                                  | Delete an image                                                         |
| `docker image prune`                                       | Remove all unused images                                                |

_Note: In previous commands, image ID can be also used instead of image name._

## Containers

| Command                                             | Description                                                   |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `docker ps [-a]`                                    | List currently running containers [+ stopped containers]      |
| `docker run [--name <container-name>] <image-name>` | Create and run a container from an image [with a custom name] |
| `docker inspect <container-name>`                   | Inspect a running container                                   |
| `docker exec -it <container-name> sh`               | Open a shell inside a running container                       |

_Note: In previous commands, container ID can be also used instead of container name._

## Docker-compose V2

| Command                                         | Description                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `docker compose up [-d]`                        | Run all containers [in detached mode]                                                       |
| `docker compose stop\|restart <container-name>` | Stop/restart one container                                                                  |
| `docker compose rm <service-name>`              | Remove a stopped service                                                                    |
| `docker compose down`                           | Stop and remove all services                                                                |
| `docker compose build`                          | Rebuilt all services                                                                        |
| `docker compose logs`                           | Get the logs from all the services. For logs of one container, extend with `<service-name>` |

## Links

- Docker CLI Cheat Sheet: https://docs.docker.com/get-started/docker_cheatsheet.pdf
- Docker Compose Cheat Sheet: https://devopscycle.com/blog/the-ultimate-docker-compose-cheat-sheet
