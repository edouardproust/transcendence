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
| `nest g module <module-name>`         | Generate a new module                                                                              |
| `nest g controller <controller-name>` | Generate a new controller                                                                          |
| `nest g service <service-name>`       | Generate a new service                                                                             |
| `nest g ressource <module-name>`      | Generate a new module containing: a controller, a service, a DTO, CRUD endpoints (REST or GraphQL) |

## Prisma ORM

| Command                                                                                                                | Description                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `npx prisma studio`                                                                                                    | Start Prisma Studio to visualize the databas in a web page                 |
| `npx prisma generate`                                                                                                  | Generate typescript types from models defined in `prisma/schema.prisma`    |
| `npx prisma migrate dev --name <migration-name>`                                                                       | Migrate models defined in `prisma/schema.prisma` to database               |
| `npx prisma generate && npx prisma migrate dev`                                                                        | Generate client + Migrate models                                           |
| `rm -rf prisma/migrations && npx prisma migrate reset -f && npx prisma generate && npx prisma migrate dev --name init` | Clean-up migrations (merge all migrations into a single one nammed "init") |

## Postgres

| Command                                                                     | Description                                      |
| --------------------------------------------------------------------------- | ------------------------------------------------ |
| `docker exec -it <postgres-container-name> psql -U <username> -d <db-name>` | Communicate with db (once container was started) |

## Links

- Deployment: https://docs.nestjs.com/deployment
