# Check.io

This project has been created as part of the 42 curriculum ("Transcendence" project) by **ahetru**, **eproust**, **matde-la**, **sluterea**. ([View subject](/subject/en.subject.pdf)).

## Description

A real-time multiplayer chess game using WebSockets.
// TODO: Project name, project goals and brief overview

## Instructions

### Prerequisites

// TODO: software, tools, versions, configuration like .env setup, etc.

```bash
sudo apt install ...
```

### How to use

#### Development Environment

```bash
# Clone repo
git clone https://github.com/edouardproust/transcendence.git checkio

# Create secrets, build docker images and run containers
make
```

- View `client` in browser: `https://localhost`
- Test `API` requests: use `curl` or `ThunderClient` (VS Code extension)
- Work on the `API`: open `api` folder in a `Dev Container` (eg. in [VS Code](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container))
- Work on the `client`: open `client` folder in a `Dev Container` (eg. in [VS Code](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container))

We use `Dev Containers` for development because `node_modules` folder contains binaries that are different between OS. Hence `node_modules` are installed in the containers only. As a consequence, `api/node_modules` ans `client/node_modules` are empty locally (on the host machine).

#### Production Environment

// TODO

## Resources

// TODO: List references related to the topic (documentation, articles, tutorials, etc.), as well as a description of how AI was used (tasks and parts of the project).

## Team Information

| Team member | Role                        | Responsabilities      |
| ----------- | --------------------------- | --------------------- |
| matde-la    | Product Owner & Developer   | Frontend developement |
| ahetru      | Product Manager & Developer | Backend developement  |
| eproust     | Technical Lead & developer  | Backend development   |
| sluterea    | Developer                   | Frontend development  |

## Project Management

- Work organization:
  - Weekly meetings on saturday morning
- Tools used for project management:
  - Jira, Google Drive
- Communication channels used:
  - Slack

## Stack

// TODO: justify choices

Main language: Typescript

### Frontend

- Language: Typescript
- Framework: ReactJS
- Tools & libraries: Vite, ViteSSR, Tailwind CSS

### Backend:

- Framework: NestJS
- Database: PostgresSQL, Redis
- Tools: Prisma ORM

### Deployment:

// TODO

### Other

// TODO: any other significant technologies or libraries (justify relevant choicea)

- **Docker**: Packaging the application and all its dependencies
- **Git**: Versioning
- **GitHub Actions**: CI/CD (build, tests, lint)
- **Jest**, **esLint**, **prettier**: Unit testing
- **Python**: Automation (seed DB, launch containers, monitoring & logs)
- **Trello**, **Slack**: Team work
- **VsCode**: IDE
- **Copilot**: Coding automation and assistance

## Database Schema

// TODO example:

Users\
├─ id (integer, PK)\
└─ created_at (datetime)

Posts\
├─ id (integer, PK)\
└─ created_at (datetime)

### Relations

//TODO example:

- **Users → Posts** : a user can have several posts.

### Table, fields and data types

// TODO example:

| Table | Field      | Type     | Description         |
| ----- | ---------- | -------- | ------------------- |
| Users | id         | integer  | Primary key         |
| Users | created_at | datetime | Date of signup      |
| Posts | id         | integer  | Primary key         |
| Posts | created_at | datetime | Date of publication |

## Features

| Feature                                        | Description                                       | Contributors                                |
| ---------------------------------------------- | ------------------------------------------------- | ------------------------------------------- |
| // TODO: Complete list of implemented features | Brief description of each feature’s functionality | Which team member(s) worked on each feature |
|                                                |                                                   |                                             |

## Modules:

| Category        | Module                                                                     | Type  | Points | Goal | Implementation                                                                                                                                                                                           | Contributors                                           |
| --------------- | -------------------------------------------------------------------------- | ----- | ------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Web             | Use a framework for both frontend and backend                              | Major | +2     |      | Frontend: ReactJS, Backend: NestJS                                                                                                                                                                       | matde-la, sluterea (ReactJS); ahetru, eproust (NestJS) |
| Web             | Allow users to interact with other users (chqt, profile or firends system) | Major | + 2    |      |                                                                                                                                                                                                          |
| Web             | A public API to interact with the database                                 | Major | +2     |      | Secured API key, rate limite, documentation, and at least 5 endpoints (GET, POST, PUT, DELETE)                                                                                                           |                                                        |
| Web             | Use an ORM for the database                                                | Minor | +1     |      | Prisma ORM                                                                                                                                                                                               | ahetru, eproust                                        |
| Gaming and UX   | Complete web-based game where users can play against each other            | Major | +2     |      | Real-time multiplayer game, live matches, game with clear rules and win/loss conditions                                                                                                                  |                                                        |
| Gaming and UX   | Remote players in real-time                                                | Major | +2     |      | Handle network latency and disconnections gracefully, provide a smooth UX for remote gameplay, reconnection logic                                                                                        |                                                        |
| User Management | Standard user management and authentication                                | Major | + 2    |      | Users can update their profile information, upload an avatar (and have a default avatar), add other users as friends and se their online status. Users have a profile page displaying their information. | all (backend and frontend)                             |
| Web             | Implement real-time features using WebSockets or similar technology        | Major | + 2    |      |                                                                                                                                                                                                          |
| Web             | Custom-made design system with reusable components                         | Minor | +1     |      | Minimum of 10 reusable components, including proper color palette, typography and icons                                                                                                                  | matde-la, sluterea                                     |
| Web             | A complete notification system for CRUD actions                            | Minor | +1     |      | Notifications popups with React on entity creationm update and deletion                                                                                                                                  |                                                        |

// TODO Add a the base the project structure and finilize only if time left
| Category | Module | Type | Points | Goal | Implementation | Contributors |
|---|---|---|---|---|---|---|
| Accessibility & i18n | Support for multiple languages | Minor | +1 | | Langage switch
| Accessibility & i18n | Support for aditional browsers | Minor | +1 | | Full compatibility in 3 browsers (Google Chrome, Firefox, Safari), documentation on browser-specific limitations, consisten UI/UX across all supported browsers | |
| User management | Game statistics and match history | Minor | +1 | | Track user game statistics (wins, losses, ranking, level, etc.), display match history (1v1 games, dates, results, opponents), show achievements and progression, leaderboard integration | all (backend and frontend) |
| User management | Advanced permissions system | Major | +2 | | View, edit and delete users (CRUD), Roles management (admin, user, guest moderator, etc.) | Different views and actions based on user role |

// TODO Bonus (if we have time left only)

| Category         | Module                               | Type  | Points | Goal | Implementation                                                                                             | Contributors |
| ---------------- | ------------------------------------ | ----- | ------ | ---- | ---------------------------------------------------------------------------------------------------------- | ------------ |
| Data & Analytics | Data exports and imports             | Minor | +1     |      | Export data in multiple formats (JSON, CSV, XML,...), Import data with validation, bulk operations support |              |
| user management  | Remote authentication with OAuth 2.0 | Minor | + 1    |      | Google, Github, 42 authentication system                                                                   |              |
| DevOps           | Health check and status page system  | Minor | +1     |      | Page system with automated backups and disaster recovery procedures                                        |              |
| Gaming and UX    | 3D graphics                          | Major | +2     |      | 3D chess board using three.js, advanced rendering technics, smooth performance and user interaction        |              |
| Gaming and UX    | Game customization options           | Minor | +1     |      | Power-ups and special abilities of pawns                                                                   |              |

**Total points**: // TODO

## Individual Contributions

| Team member | Contribution                                            | Implementations                                                      | Challenges                                      |
| ----------- | ------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| // TODO     | Detailed breakdown of what each team member contributed | Specific features, modules, or components implemented by each person | Any challenges faced and how they were overcome |
| ahetru      |                                                         |                                                                      |                                                 |
| eproust     |                                                         |                                                                      |                                                 |
| matde-la    |                                                         |                                                                      |                                                 |
| sluterea    |                                                         |                                                                      |                                                 |

## Licence

// TODO
