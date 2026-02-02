# Backend Cheatsheet

## NodeJS

| Command | Description |
|---|---|
| `npm run start:dev` | Launch project in watch-mode |
| `npm run start:prod` | Launch project in production |
| `npm run test` | Run app tests (using Jest) |

## NestjJS

| Command | Description |
|---|---|
| `npm i -g @nestjs/cli`| Install NestJS CLI globally |
| `nest new <project-name>` | Create new project |
| `nest g module <module-name>` | Generate a new module |
| `nest g controller <controller-name>` | Generate a new controller |
| `nest g service <service-name>` | Generate a new service |
| `nest g ressource <module-name>` | Generate a new module containing: a controller, a service, a DTO, CRUD endpoints (REST or GraphQL) |

## Useful tools:

- `REST Client` extension: visualize HTTP response directly in VsCode

## Links

- Deployment: https://docs.nestjs.com/deployment