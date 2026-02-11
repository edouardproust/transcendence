# Backend Cheatsheet

## NodeJS

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run start:dev`  | Launch project in watch-mode |
| `npm run start:prod` | Launch project in production |
| `npm run test`       | Run app tests (using Jest)   |

## NestjJS

| Command                               | Description                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm i -g @nestjs/cli`                | Install NestJS CLI globally                                                                        |
| `nest new <project-name>`             | Create new project                                                                                 |
| `nest g module <module-name>`         | Generate a new module                                                                              |
| `nest g controller <controller-name>` | Generate a new controller                                                                          |
| `nest g service <service-name>`       | Generate a new service                                                                             |
| `nest g ressource <module-name>`      | Generate a new module containing: a controller, a service, a DTO, CRUD endpoints (REST or GraphQL) |

## Prisma ORM

COurse video (1h45): https://www.youtube.com/watch?v=uWZ_6pDbLpU

| Command                                        | Description                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| npm install -D prisma                          | Install CLI (dev only)                                                  |
| npm install @prisma/client                     | Instal client (dev & prod)                                              |
| npx prisma init                                | Initialize Prisma                                                       |
| npx prisma generate                            | Generate client (schema must be modified first: `prisma/schema.prisma`) |
| npx prisma migrate dev --name <migration-name> | Migrate                                                                 |

## Postgres

| Command                                                                     | Description                                      |
| --------------------------------------------------------------------------- | ------------------------------------------------ |
| `docker exec -it <postgres-container-name> psql -U <username> -d <db-name>` | Communicate with db (once container was started) |

## Links

- Deployment: https://docs.nestjs.com/deployment
