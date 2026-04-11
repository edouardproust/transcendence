*This project has been created as part of the 42 curriculum by ahetru, eproust, matde-la, sluterea.*

# Chess 42

An online chess platform built for the 42 `ft_transcendence` project. The application combines a React frontend, a NestJS backend, PostgreSQL persistence and WebSockets to deliver live multiplayer matches, an AI opponent, a friends system and an admin area. The project is designed to be run entirely with containers using a single command.

([View subject](docs/en.subject.pdf))

## Description

### Project name

**Chess 42**

### Goal

Build a complete web application around chess that demonstrates team organization, full-stack development, real-time communication, database design and modular feature delivery within the `ft_transcendence` framework.

### Brief overview

Chess 42 lets registered users create accounts, manage their profile, add friends, see online presence, play live chess against other users, or train against Stockfish with configurable difficulty. The platform also includes an admin interface for user and game management, reusable UI components, notifications for CRUD actions and a documented backend API.

### Key features

- Secure signup and login with JWT-based authentication
- User profiles with avatar, ELO, match statistics and history
- Friends system with requests, accept/reject flow and online presence
- Real-time online chess with legal move validation, timers, draw offers, resignation and in-game chat
- AI chess mode powered by Stockfish with configurable level and color
- 2D and 3D board views with persistent display preferences
- Admin dashboard with search, sorting, pagination and protected actions

## Instructions

### Prerequisites

#### Production

- Docker Engine with Docker Compose v2
- `make`

#### Development

- Docker Engine with Docker Compose v2
- `make`
- An IDE with Dev Containers support is recommended, for example VS Code with the Dev Containers extension

### Configuration

- The project uses local `.env` files ignored by Git.
- In the current workflow, `make` runs the setup scripts in `docker/` and generates the local configuration automatically (`docker/.env`, `client/.env`).
- Most development dependencies are installed inside the containers, so there is no need to install Node.js packages on the host machine.

### How to use

#### Production

On the production server:

```bash
git clone https://github.com/edouardproust/transcendence.git checkio
cd checkio
make PROD=1
```

This command prepares secrets, builds the production images and starts the stack.

#### Development

On a local machine:

```bash
git clone git@github.com:edouardproust/transcendence.git checkio
cd checkio
make
```

This command prepares the local environment, builds the development images and starts the services.

Once `make` finishes, these URLs are available from the host machine:

- App: `https://localhost:8443`
- HTTP entrypoint: `http://localhost:8080`
- API docs (Swagger): `http://localhost:3000`
- Adminer: `http://localhost:8081`

### Development workflow

- Open either `client/` or `api/` in your IDE
- Reopen the folder in the Dev Container when prompted
- Work directly inside the running container
- Use the browser on `https://localhost:8443` to test the frontend
- Use Swagger or `curl` to test API endpoints

Notes:

- `node_modules` are installed inside the containers, so `api/node_modules` and `client/node_modules` stay empty on the host
- Useful Docker and Compose commands are documented in [docs/DOCKER.md](/home/matde-la/Documents/tr/docs/DOCKER.md)
- The team Git workflow is documented in [docs/GIT-WORKFLOW.md](/home/matde-la/Documents/tr/docs/GIT-WORKFLOW.md)

## CI/CD

The project uses GitHub Actions for continuous integration. On pushes and pull requests targeting `develop` or `main`, the pipeline runs:

- Unit tests with Jest and coverage thresholds
- End-to-end tests with PostgreSQL, MinIO and Prisma migrations

To run the workflow locally:

```bash
act
```

## Resources

### Technical references

- 42 subject: [docs/en.subject.pdf](/home/matde-la/Documents/tr/docs/en.subject.pdf)
- React documentation: https://react.dev/
- NestJS documentation: https://docs.nestjs.com/
- Prisma documentation: https://www.prisma.io/docs/
- Socket.IO documentation: https://socket.io/docs/v4/
- Tailwind CSS documentation: https://tailwindcss.com/docs
- chess.js documentation: https://jhlywa.github.io/chess.js/
- Three.js documentation: https://threejs.org/docs/
- Stockfish: https://stockfishchess.org/
- Project design system notes: [docs/design-system.md](/home/matde-la/Documents/tr/docs/design-system.md)

### How AI was used

AI tools were used as development assistants, not as an unchecked code generator. Typical use cases included:

- brainstorming implementation approaches for isolated frontend and backend tasks
- generating boilerplate or refactoring suggestions for components, services and DTOs
- helping draft documentation and clarify technical explanations
- proposing test cases and debugging hypotheses during development

All generated suggestions were reviewed, adapted and validated manually by the team before being kept in the project.

## Team Information

| Team member | Assigned role(s) | Responsibilities |
| ----------- | ----------------- | ---------------- |
| matde-la | Product Owner, Developer | Defined product priorities, validated functional scope, contributed mainly to frontend features, UI integration and product consistency |
| ahetru | Project Manager, Developer | Coordinated team follow-up, tracked progress and blockers, contributed mainly to backend features and API work |
| eproust | Technical Lead, Developer | Drove architecture and technical decisions, reviewed critical backend structure, contributed mainly to backend and data design |
| sluterea | Developer | Contributed mainly to frontend implementation, interface integration and user experience work |

## Project Management

- Work organization: weekly sync meetings, feature breakdown into smaller tasks, work split between frontend, backend and integration tasks, and peer reviews on important changes
- Tools used for project management: Jira, Google Drive, GitHub and the repository documentation
- Communication channels used: Slack and regular in-person / remote team syncs

## Stack

Main language: TypeScript

### Frontend

- Language: TypeScript
- Framework: React with Vite
- Styling: Tailwind CSS
- State and routing: Zustand, React Router
- Chess and rendering libraries: `react-chessboard`, `chess.js`, `three`, `@react-three/fiber`, `@react-three/drei`

Why this choice:

- React offered a fast way to structure a modular interface around pages, hooks and reusable components
- Vite kept the development loop simple and fast
- Tailwind CSS helped us build a consistent UI system quickly while still keeping custom reusable components
- `react-chessboard`, `chess.js` and Three.js reduced the low-level rendering cost while keeping control over chess-specific behavior

### Backend

- Framework: NestJS
- Language: TypeScript
- Real-time layer: WebSockets with Socket.IO
- API documentation: Swagger
- Validation and security: `class-validator`, JWT, bcrypt

Why this choice:

- NestJS provides a clear modular architecture with controllers, services, guards and DTOs, which fits a team project well
- TypeScript on both frontend and backend reduced context switching and improved shared domain understanding
- Socket.IO made live game synchronization and presence features easier to implement and test

### Database

- System: PostgreSQL
- ORM: Prisma

Why this choice:

- PostgreSQL is a reliable relational database for structured entities such as users, games and friendships
- Prisma gave us typed queries, explicit relations, migrations and a schema that is easy to review as a team

### Deployment

- Containerization: Docker and Docker Compose
- Reverse proxy / HTTPS entrypoint: Nginx
- Object storage: MinIO

Why this choice:

- The subject requires a containerized deployment that runs with a single command
- Docker Compose lets the full stack start consistently in development and production
- Nginx centralizes HTTPS entry and routing
- MinIO provides a simple local object storage solution for user avatars

### Other significant tools

- Jest: unit and end-to-end testing
- ESLint and Prettier: linting and formatting
- Adminer: database inspection in development
- GitHub Actions: CI automation
- Dev Containers: reproducible development environment inside containers

## Database Schema

### Structure overview

```text
User
├─ id: String (PK)
├─ email: String (unique)
├─ password: String
├─ username: String (unique)
├─ role: USER | ADMIN
├─ elo: Int
├─ avatarKey: String
├─ isOnline: Boolean
├─ lastSeen: DateTime?
├─ createdAt: DateTime
└─ updatedAt: DateTime

Game
├─ id: String (PK)
├─ status: WAITING | ONGOING | FINISHED | ABORTED
├─ mode: ONLINE | AI
├─ whiteId: String?
├─ blackId: String?
├─ invitedUserId: String?
├─ winnerId: String?
├─ drawOfferedBy: String?
├─ currentFen: String
├─ pgn: String
├─ timeControl: String
├─ whiteTimeLeft: Int?
├─ blackTimeLeft: Int?
├─ createdAt: DateTime
└─ updatedAt: DateTime

FriendRequest
├─ id: String (PK)
├─ senderId: String (FK -> User)
├─ receiverId: String (FK -> User)
└─ createdAt: DateTime

Friendship
├─ id: String (PK)
├─ userId: String (FK -> User)
├─ friendId: String (FK -> User)
└─ createdAt: DateTime
```

### Relations

- `User -> Game`: a user can play many games as white, black, invited user or winner
- `User -> FriendRequest`: a user can send and receive many friend requests
- `User -> Friendship`: friendships are stored as explicit relations between two users
- `Game -> User`: each game references the participating users and, when applicable, the winner

### Tables, fields and data types

| Table | Field | Type | Description |
| ----- | ----- | ---- | ----------- |
| `users` | `id` | `String` | Primary key (UUID) |
| `users` | `email` | `String` | Unique user email |
| `users` | `username` | `String` | Unique public username |
| `users` | `role` | `Role` | User permission level |
| `users` | `elo` | `Int` | Chess rating |
| `users` | `avatarKey` | `String` | Avatar file path in storage |
| `users` | `isOnline` | `Boolean` | Presence status |
| `games` | `status` | `GameStatus` | Game lifecycle state |
| `games` | `mode` | `GameMode` | Online or AI game |
| `games` | `currentFen` | `String` | Current board position |
| `games` | `pgn` | `String` | Recorded move history |
| `games` | `timeControl` | `String` | Selected time format |
| `friend_requests` | `senderId` | `String` | User who sent the request |
| `friend_requests` | `receiverId` | `String` | User who received the request |
| `friendships` | `userId` | `String` | Owner side of the friendship |
| `friendships` | `friendId` | `String` | Friend side of the friendship |

## Features

| Feature | Description | Contributors |
| ------- | ----------- | ------------ |
| Authentication and account creation | Users can register, log in securely and access protected routes with JWT authentication | ahetru, eproust, matde-la |
| Profile management | Users can edit their profile, upload an avatar, view ELO, match stats and recent games | ahetru, eproust, matde-la, sluterea |
| Friends system and presence | Users can search for others, send requests, accept or reject them, remove friends and see online status | ahetru, eproust, matde-la, sluterea |
| Multiplayer chess | Users can create and join online games with real-time synchronization, legal move validation and time controls | ahetru, eproust, matde-la, sluterea |
| In-game social interactions | Online games include chat, draw offers and resignation flow | ahetru, eproust, matde-la, sluterea |
| AI opponent | Users can play against Stockfish with configurable difficulty and side selection | matde-la, sluterea, eproust |
| 2D and 3D game views | The game can be played in classic 2D or with a 3D board rendered in the browser | matde-la, sluterea |
| Lobby and invitations | Users can browse available games, create matches and join the right game flow | matde-la, sluterea, ahetru, eproust |
| Admin panel | Admins can inspect users and games, update selected data and perform protected management actions | ahetru, eproust, matde-la |
| Notifications and reusable UI | The application uses shared components and toast notifications across main CRUD flows | matde-la, sluterea |

## Modules

| Category | Module | Type | Points | Implementation | Contributors |
| -------- | ------ | ---- | ------ | -------------- | ------------ |
| Web | Use a framework for both frontend and backend | Major | +2 | React with Vite on the frontend and NestJS on the backend | matde-la, sluterea, ahetru, eproust |
| Web | Implement real-time features using WebSockets or similar technology | Major | +2 | Socket.IO is used for online games, live updates, draw offers, game chat and presence | ahetru, eproust, matde-la |
| Web | Allow users to interact with other users | Major | +2 | Profiles, friends system, online presence and in-game chat between players | ahetru, eproust, matde-la, sluterea |
| Web | Use an ORM for the database | Minor | +1 | Prisma manages the PostgreSQL schema, relations, typed queries and migrations | ahetru, eproust |
| Web | A complete notification system for CRUD actions | Minor | +1 | Shared toast notifications are used for profile, avatar, friends, game and admin actions | matde-la, sluterea |
| Web | Custom-made design system with reusable components | Minor | +1 | Shared palette, typography and reusable UI components are documented in `docs/design-system.md` | matde-la, sluterea |
| Web | Implement advanced search functionality with filters, sorting, and pagination | Minor | +1 | The admin area supports search, filtering, sorting and pagination for users and games | ahetru, eproust, matde-la |
| User Management | Standard user management and authentication | Major | +2 | Registration, login, JWT auth, profile updates, avatar handling, presence and friend management | ahetru, eproust, matde-la, sluterea |
| User Management | Advanced permissions system | Major | +2 | Admin roles, protected routes, admin guards and protected user/game management actions | ahetru, eproust, matde-la |
| Artificial Intelligence | AI Opponent | Major | +2 | Stockfish-powered chess mode with configurable level and persistent preferences | matde-la, sluterea, eproust |
| Gaming and UX | Complete web-based game where users can play against each other | Major | +2 | Real-time chess matches with legal moves, timer handling, end states, draw flow and exported notation | ahetru, eproust, matde-la, sluterea |
| Gaming and UX | 3D graphics | Major | +2 | Optional 3D chess board built with Three.js, `@react-three/fiber` and `@react-three/drei` | matde-la, sluterea |
| Gaming and UX | Game customization options | Minor | +1 | Users can switch between 2D and 3D boards, choose board themes and configure AI settings | matde-la, sluterea |

**Total points**: 21

## Individual Contributions

| Team member | Contribution | Implementations | Challenges |
| ----------- | ------------ | --------------- | ---------- |
| ahetru | Backend feature development and project coordination | Authentication flows, user and friends endpoints, admin-related backend work, integration support between frontend and backend | Keeping the team aligned while maintaining feature delivery and consistent API behavior |
| eproust | Technical architecture and backend foundations | NestJS module structure, Prisma data model, game service logic, backend code quality and technical reviews | Designing a clean architecture for real-time game logic and keeping modules maintainable |
| matde-la | Product direction and main frontend integration | Product scope definition, main UI flows, lobby/profile/game integration, reusable UI system, admin frontend work | Balancing product priorities with implementation effort and keeping the experience coherent across screens |
| sluterea | Frontend feature delivery and interface polish | Frontend components, page integration, gameplay UI work, styling and user experience improvements | Translating complex chess interactions into clear and usable interfaces |

## License

This repository is currently an academic project for 42 and is not distributed under a separate open-source license. The backend package is marked as `UNLICENSED`.
