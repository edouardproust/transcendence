# API (backend)

The API is based on NestJS and Prisma ORM.

## Development workflow

To edit the API, open this folder in a `Dev Container`:

- For example, open the current folder in VS Code (from project root: `code client`), then `Ctrl+Shift+P` → `Dev Containers: Reopen in Container` ([Doc](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container)).
- Additionnal IDE extensions can be set in [`.devcontainer/devcontainer.json`](.devcontainer/devcontainer.json), then restart the docker container.
- Commits and PRs must follow the [Git workflow](../docs/GIT-WORKFLOW.md).

## Useful commands

These commands must be used inside the `tr-api` container (via the terminal inside the corresponding `Dev Container` or using `docker exec tr-api sh -c "<command>"`)

### Compodoc

### NodeJS

| Command              | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `npm run doc`        | Build compodoc and view it in browser                                 |
| `npm run doc:serve`  | View compodoc in browser                                              |
| `npm run start:dev`  | Launch project in watch-mode                                          |
| `npm run start:prod` | Launch project in production                                          |
| `npm run test`       | Run unit tests (in each `/src/**/*.spec.ts` file) using Jest          |
| `npm run test:cov`   | Run unit tests and calculate their code coverage, using Jest          |
| `npm run test:e2e`   | Run end-to-end tests (in each `/tests/*.e2e-spec.ts` file) using Jest |

### NestJS

| Command                               | Description                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `nest g module <module-name>`         | Generate a new module                                                                              |
| `nest g controller <controller-name>` | Generate a new controller                                                                          |
| `nest g service <service-name>`       | Generate a new service                                                                             |
| `nest g ressource <module-name>`      | Generate a new module containing: a controller, a service, a DTO, CRUD endpoints (REST or GraphQL) |

### Prisma ORM

| Command                                                                                                                | Description                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `npx prisma studio`                                                                                                    | Start Prisma Studio to visualize the database in a web page                |
| `npx prisma db seed`                                                                                                   | Fill db with data setup in `prisma/seed.ts` (fixtures)                     |
| `npx prisma generate`                                                                                                  | Generate typescript types from models defined in `prisma/schema.prisma`    |
| `npx prisma migrate dev --name <migration-name>`                                                                       | Migrate models defined in `prisma/schema.prisma` to database               |
| `npx prisma generate && npx prisma migrate dev`                                                                        | Generate client + Migrate models                                           |
| `rm -rf prisma/migrations && npx prisma migrate reset -f && npx prisma generate && npx prisma migrate dev --name init` | Clean-up migrations (merge all migrations into a single one nammed "init") |

## Postgres

| Command                                                                     | Description                                      |
| --------------------------------------------------------------------------- | ------------------------------------------------ |
| `docker exec -it <postgres-container-name> psql -U <username> -d <db-name>` | Communicate with db (once container was started) |

## Links

- Decode JWT token: https://www.jwt.io/
- Deployment: https://docs.nestjs.com/deployment
