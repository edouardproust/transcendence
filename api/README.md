# API (backend)

The API is based on NestJS and Prisma ORM.

## API documentation (Swagger)

Start the docker containers, then go to [http://localhost:3000](http://localhost:3000).

## Development workflow

To edit the API, open this folder in a `Dev Container`:

- For example, open the current folder in VS Code (from project root: `code client`), then `Ctrl+Shift+P` → `Dev Containers: Reopen in Container` ([Doc](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container)).
- Additionnal IDE extensions can be set in [`.devcontainer/devcontainer.json`](.devcontainer/devcontainer.json), then restart the docker container.
- Commits and PRs must follow the [Git workflow](../docs/GIT-WORKFLOW.md).

## Navigate databases

### Using adminer

To visualize all the databases from the host machine:

1. Start containers with `make`
2. Go to [http://localhost:8081](http://localhost:8081) over plain HTTP and login:
    - System: `PostgresSQL`
    - Server: `postgres`
    - Username: the one you chose (default: `testuser`)
    - Password: the one you chose (default: `testuser123`)
    - Database: leave empty

### Using Prisma Studio

When developing inside the `tr-api` container, it is easier to use Prisma Studio directly: `npx prisma studio`.

## Useful commands

**These commands must be used inside the `tr-api` container (via the terminal inside the corresponding `Dev Container` or using `docker exec tr-api sh -c "<command>"`)**

### Node.js server

Commands are run **inside the running container\***.

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run start:dev`  | Launch project in watch-mode |
| `npm run start:prod` | Launch project in production |

### Tests

- Tests are made with **Jest**, a JavaScript testing framework with built-in mocking, assertions, and code coverage.

| Command            | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `npm run test`     | Run unit tests (in each `/src/**/*.spec.ts` file)          |
| `npm run test:cov` | Run unit tests and calculate their code coverage           |
| `npm run test:e2e` | Run end-to-end tests (in each `/tests/*.e2e-spec.ts` file) |

- CI workflow is made using **Github Actions**. To test the CI locally, you can use `act`:

```bash
# Install act globally on the host machine
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
# Inside the project folder (alongside the .github/ folder)
act push
```

### Nest.js CLI

| Command                               | Description                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `nest g module <module-name>`         | Generate a new module                                                                              |
| `nest g controller <controller-name>` | Generate a new controller                                                                          |
| `nest g service <service-name>`       | Generate a new service                                                                             |
| `nest g ressource <module-name>`      | Generate a new module containing: a controller, a service, a DTO, CRUD endpoints (REST or GraphQL) |

### Prisma ORM CLI

Prisma ORM is a type-safe database toolkit that simplifies working with databases in Node.js and TypeScript applications.

| Command                                                                                                                | Description                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `npx prisma db seed`                                                                                                   | Fill db with data setup in `prisma/seed.ts` (fixtures)                     |
| `npx prisma generate`                                                                                                  | Generate typescript types from models defined in `prisma/schema.prisma`    |
| `npx prisma migrate dev --name <migration-name>`                                                                       | Migrate models defined in `prisma/schema.prisma` to database               |
| `npx prisma generate && npx prisma migrate dev`                                                                        | Generate client + Migrate models                                           |
| `rm -rf prisma/migrations && npx prisma migrate reset -f && npx prisma generate && npx prisma migrate dev --name init` | Clean-up migrations (merge all migrations into a single one nammed "init") |
| `npx prisma studio`                                                                                                    | Start Prisma Studio to visualize the db in a web page                      |

### Compodoc

Compodoc is an open-source documentation tool that generates interactive technical documentation for NestJS applications directly from the source code and decorators.

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `npm run doc`       | Build compodoc and view it in browser |
| `npm run doc:serve` | View compodoc in browser              |

## Links

- Decode JWT token: https://www.jwt.io/
- Deployment: https://docs.nestjs.com/deployment
