# Chess 42 - análisis y defensa de módulos

Este documento cruza tres fuentes:

- `README.md`, donde aparece la selección actual de módulos.
- `docs/en.subject.pdf` / `docs/en.subject.txt`, donde está la lista completa de módulos disponibles.
- El código actual de `client/` y `api/`, para decidir qué se puede defender de verdad.

## Resumen ejecutivo

El mínimo del subject es **14 puntos**.

Estado recomendado:

| Nivel | Puntos | Criterio |
| --- | ---: | --- |
| Sólidos para defender | 21 | Hay implementación clara y demostrable en código. |
| Defendibles con riesgo | +3 | Funcionan parcialmente o dependen de cómo de estricto sea el evaluador. |
| Total máximo razonable hoy | 24 | Incluye los módulos con riesgo: remote players y estadísticas/historial. |

Módulos sólidos:

| Categoría | Módulo | Puntos |
| --- | --- | ---: |
| Web | Framework frontend + backend | 2 |
| Web | Real-time features con WebSockets | 2 |
| Web | Interacción entre usuarios | 2 |
| Web | ORM | 1 |
| Web | Sistema de notificaciones CRUD | 1 |
| Web | Design system propio | 1 |
| Web | Advanced search | 1 |
| User Management | Auth y gestión estándar de usuario | 2 |
| User Management | Permisos avanzados | 2 |
| Artificial Intelligence | AI Opponent | 2 |
| Gaming and UX | Juego web completo | 2 |
| Gaming and UX | Gráficos 3D avanzados | 2 |
| Gaming and UX | Personalización del juego | 1 |

Módulos defendibles con riesgo:

| Categoría | Módulo | Puntos | Riesgo |
| --- | --- | ---: | --- |
| Gaming and UX | Remote players | 2 | Hay juego remoto en tiempo real, pero la reconexión no tiene ventana de gracia: una desconexión real puede terminar la partida. |
| User Management | Game statistics and match history | 1 | Hay estadísticas, historial y ranking por ELO; falta una capa explícita de achievements/progression. |

No recomiendo defender como módulo hoy:

- Public API: hay Swagger y muchos endpoints, pero no hay validación backend real de API key ni rate limiting.
- File upload: hay avatar upload, pero no cubre sistema general de ficheros con múltiples tipos, preview/progreso y gestión completa.
- Additional browsers / i18n / accessibility AA / OAuth / 2FA / tournaments / spectator mode / DevOps / Blockchain: no hay implementación suficiente en el código actual.

## Bloqueos antes de evaluar

1. Ejecutar `npm run build` dentro del contenedor del cliente. En host no hay `npm`, y `docker compose` no arranca si falta `docker/.env`.
2. Crear o regenerar `docker/.env` con `make` o `docker/setup.dev.sh` antes de la demo.
3. Añadir una página de **Terms of Service**. El subject exige Privacy Policy y Terms of Service; ahora solo existe `PrivacyPolicyPage`.
4. Actualizar el README: ahora promete o lista módulos que no conviene reclamar, especialmente Public API, i18n, additional browsers, OAuth, data export/import y health/status.
5. Si hay tiempo, mejorar remote players con una ventana de reconexión antes de finalizar por desconexión.
6. Si hay tiempo, añadir achievements simples y persistidos para reforzar `Game statistics and match history`.

## Tabla completa de módulos del subject

### Web

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| Framework frontend + backend | Major | 2 | React + Vite y NestJS | Defender |
| Frontend framework | Minor | 1 | Cubierto por el major anterior | No contarlo separado |
| Backend framework | Minor | 1 | Cubierto por el major anterior | No contarlo separado |
| Real-time features con WebSockets | Major | 2 | Socket.IO para partida, chat, draw, game updates y presencia | Defender |
| Interacción entre usuarios | Major | 2 | Perfil, amigos, estado online y chat de partida | Defender |
| Public API con API key, rate limit y docs | Major | 2 | Hay endpoints y Swagger; falta API key backend y rate limit | No defender |
| ORM | Minor | 1 | Prisma sobre PostgreSQL | Defender |
| Notification system para CRUD | Minor | 1 | `ToastProvider` y `pushToast` en perfil, amigos, partidas, admin | Defender |
| Real-time collaborative features | Minor | 1 | No hay shared workspace/live editing/collab drawing | No defender |
| SSR | Minor | 1 | Vite SPA, no SSR | No defender |
| PWA offline/installable | Minor | 1 | No service worker/manifest/offline | No defender |
| Design system propio | Minor | 1 | Tokens y más de 10 componentes UI reutilizables | Defender |
| Advanced search con filtros, sorting y paginación | Minor | 1 | Admin users/games con search/filter/sort/pagination | Defender |
| File upload and management | Minor | 1 | Avatar upload solamente | No defender salvo que se amplíe |

### Accessibility and Internationalization

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| WCAG 2.1 AA completo | Major | 2 | No hay auditoría ni soporte completo demostrado | No defender |
| 3 idiomas | Minor | 1 | No hay i18n propio ni traducciones completas | No defender |
| RTL | Minor | 1 | No hay soporte RTL | No defender |
| Browsers adicionales | Minor | 1 | No hay matriz de pruebas ni documentación Firefox/Safari/Edge | No defender |

### User Management

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| Auth y gestión estándar de usuarios | Major | 2 | Registro/login, JWT, perfil, avatar, amigos, online status | Defender |
| Game statistics and match history | Minor | 1 | Stats, historial y ranking ELO; faltan achievements/progression explícitos | Defender con riesgo |
| OAuth 2.0 | Minor | 1 | No implementado | No defender |
| Advanced permissions system | Major | 2 | Roles ADMIN/USER, guards, admin CRUD y vistas protegidas | Defender |
| Organization system | Major | 2 | No hay organizaciones | No defender |
| 2FA | Minor | 1 | No implementado | No defender |
| User activity analytics dashboard | Minor | 1 | El admin dashboard no equivale a analytics de actividad de usuario completo | No defender |

### Artificial Intelligence

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| AI Opponent | Major | 2 | Stockfish, 20 niveles, delay humano, color configurable | Defender |
| RAG system | Major | 2 | No implementado | No defender |
| LLM interface | Major | 2 | No implementado | No defender |
| Recommendation ML | Major | 2 | No implementado | No defender |
| Content moderation AI | Minor | 1 | No implementado | No defender |
| Voice/speech integration | Minor | 1 | No implementado | No defender |
| Sentiment analysis | Minor | 1 | No implementado | No defender |
| Image recognition/tagging | Minor | 1 | No implementado | No defender |

### Cybersecurity

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| WAF/ModSecurity + HashiCorp Vault | Major | 2 | No implementado | No defender |

### Gaming and User Experience

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| Juego web completo entre usuarios | Major | 2 | Ajedrez online con reglas, movimientos legales, win/loss/draw | Defender |
| Remote players en tiempo real | Major | 2 | Dos jugadores remotos con Socket.IO; reconexión mejorable | Defender con riesgo |
| Multiplayer 3+ | Major | 2 | Ajedrez 1v1 | No defender |
| Otro juego con historial y matchmaking | Major | 2 | Solo ajedrez; IA no cuenta como segundo juego distinto | No defender |
| Gráficos 3D avanzados | Major | 2 | Three.js/react-three-fiber, cámara, luces, sombras, piezas 3D | Defender |
| Advanced chat features | Minor | 1 | Chat básico sin bloqueo, historial persistido, typing/read receipts, invites | No defender |
| Tournament system | Minor | 1 | No implementado | No defender |
| Game customization options | Minor | 1 | Vista 2D/3D, temas, color IA, nivel IA persistido | Defender |
| Gamification system | Minor | 1 | No hay 3 features persistidas de gamificación | No defender |
| Spectator mode | Minor | 1 | No implementado | No defender |

### DevOps

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| ELK logs | Major | 2 | No implementado | No defender |
| Prometheus + Grafana | Major | 2 | No implementado | No defender |
| Backend as microservices | Major | 2 | Backend modular NestJS, pero no microservicios separados | No defender |
| Health/status + backups/DR | Minor | 1 | Hay healthcheck de Postgres en Docker, no status page/backups/DR | No defender |

### Data and Analytics

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| Advanced analytics dashboard | Major | 2 | Admin stats sin gráficos interactivos/export/date ranges | No defender |
| Data export/import | Minor | 1 | Export TXT de partida, pero no import ni JSON/CSV/XML/bulk | No defender |
| GDPR compliance features | Minor | 1 | Privacy page y borrado de usuario, pero no solicitud/export completo de datos | No defender |

### Blockchain

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| Tournament scores on blockchain | Major | 2 | No hay torneos ni blockchain | No defender |
| ICP backend | Minor | 1 | No implementado | No defender |

### Modules of Choice

| Módulo | Tipo | Puntos | Estado | Veredicto |
| --- | --- | ---: | --- | --- |
| Custom major module | Major | 2 | No hay justificación específica en README | No defender |
| Custom minor module | Minor | 1 | No hay justificación específica en README | No defender |

## Guion de defensa por módulo defendible

### 1. Framework frontend + backend (+2)

Qué decir:

- El frontend usa React con Vite y TypeScript.
- El backend usa NestJS con controladores, servicios, módulos, guards y DTOs.
- La separación está clara: `client/src/features`, `client/src/services`, `api/src/*/*.controller.ts`, `api/src/*/*.service.ts`.

Qué enseñar:

- `client/src/main.tsx`
- `client/src/app/router.tsx`
- `api/src/main.ts`
- `api/src/app.module.ts`

Frase útil:

> Usamos React para la UI y NestJS para una API modular; el routing, servicios, guards y DTOs están separados por dominio.

### 2. Real-time features con WebSockets (+2)

Qué decir:

- Socket.IO sincroniza partidas online en tiempo real.
- Los eventos cubren `joinGame`, `makeMove`, `gameUpdate`, `gameEnd`, `offerDraw`, `acceptDraw`, `declineDraw`, `chatMessage` y reconexión.
- También hay socket de presencia para estado online.

Qué enseñar:

- Abrir dos navegadores, unirse a la misma partida y mover una pieza.
- Mostrar que el movimiento se refleja en el otro cliente.
- Enviar un mensaje de chat y ofrecer tablas.

Evidencia:

- `api/src/game/game.gateway.ts`
- `client/src/hooks/useGameSocket.ts`
- `client/src/engine/socket.ts`
- `api/src/presence/presence.gateway.ts`
- `client/src/engine/presenceSocket.ts`

### 3. Interacción entre usuarios (+2)

Qué decir:

- La interacción mínima del subject está cubierta: chat, perfiles y sistema de amigos.
- El chat existe dentro de la partida online.
- Los perfiles muestran información de usuario, avatar, ELO, estado online, stats y amistades.
- El sistema de amigos permite buscar, enviar solicitud, aceptar, rechazar y eliminar.

Qué enseñar:

- Buscar usuario desde perfil.
- Enviar y aceptar solicitud de amistad.
- Ver lista de amigos y estado online.
- Entrar a una partida y usar el chat.

Evidencia:

- `client/src/features/profile/ProfilePage.tsx`
- `api/src/friends/friends.controller.ts`
- `api/src/friends/friends.service.ts`
- `client/src/features/game/OnlineGamePage.tsx`
- `api/src/game/game.gateway.ts`

### 4. ORM (+1)

Qué decir:

- Prisma gestiona el modelo relacional sobre PostgreSQL.
- El esquema define usuarios, partidas, solicitudes de amistad y amistades.
- Las relaciones de jugadores y amistades están modeladas explícitamente.

Qué enseñar:

- `api/prisma/schema.prisma`
- Uso en servicios, por ejemplo `this.prisma.game.findMany` y `this.prismaService.user.findMany`.

Evidencia:

- `api/prisma/schema.prisma`
- `api/src/prisma/prisma.service.ts`
- `api/src/users/users.service.ts`
- `api/src/game/game.service.ts`

### 5. Notification system para CRUD (+1)

Qué decir:

- Hay un sistema de toasts reutilizable con estados `success`, `error` e `info`.
- Se usa en crear partidas, perfil, avatar, amigos, admin users/games y eventos de partida.

Qué enseñar:

- Editar perfil: toast de éxito/error.
- Subir avatar: toast de éxito/error.
- Enviar/aceptar/rechazar amistad.
- Crear partida y eliminar usuario/partida desde admin.

Evidencia:

- `client/src/components/ui/ToastProvider.tsx`
- `client/src/features/profile/ProfilePage.tsx`
- `client/src/features/lobby/LobbyPage.tsx`
- `client/src/features/admin/AdminUsers.tsx`
- `client/src/features/admin/AdminGames.tsx`
- `client/src/hooks/useGameSocket.ts`

### 6. Design system propio (+1)

Qué decir:

- Hay componentes UI reutilizables y tokens de diseño propios.
- El subject exige mínimo 10 componentes reutilizables; aquí hay más de 10.

Componentes defendibles:

- `Button`
- `Input`
- `Card`
- `Modal`
- `Avatar`
- `Badge`
- `Spinner`
- `Icon`
- `ToastProvider`
- `Navbar`
- `Layout`
- `GameHeader`
- `GameLayout`

Evidencia:

- `client/src/components/ui/designSystem.ts`
- `client/src/components/ui/Button.tsx`
- `client/src/components/ui/Input.tsx`
- `client/src/components/ui/Card.tsx`
- `client/src/components/ui/Modal.tsx`
- `docs/design-system.md`

Frase útil:

> No es una colección suelta de componentes: hay tokens de diseño y componentes compartidos usados en auth, lobby, perfil, admin y juego.

### 7. Advanced search (+1)

Qué decir:

- Admin users tiene búsqueda por username/email, ordenación y paginación.
- Admin games tiene filtros por estado, ordenación y paginación.
- El backend aplica las consultas con Prisma y DTOs validados.

Qué enseñar:

- `/admin/users`: buscar por nombre/email, ordenar por ELO/rol/fecha, cambiar asc/desc y paginar.
- `/admin/games`: filtrar por estado, ordenar por fecha/estado/modo/tiempo y paginar.

Evidencia:

- `api/src/admin/dtos/admin-users-query.dto.ts`
- `api/src/admin/dtos/admin-games-query.dto.ts`
- `api/src/admin/admin.service.ts`
- `client/src/features/admin/AdminUsers.tsx`
- `client/src/features/admin/AdminGames.tsx`
- `client/src/services/adminService.ts`

### 8. Standard user management and authentication (+2)

Qué decir:

- Registro/login con JWT.
- Password hasheado con bcrypt.
- Login con email o username.
- Perfil editable con username/email.
- Avatar con default y upload.
- Amigos y online status.

Qué enseñar:

- Register/login.
- Editar perfil.
- Subir avatar.
- Buscar amigo y enviar solicitud.
- Ver perfil propio y perfil de otro usuario.

Evidencia:

- `api/src/auth/auth.controller.ts`
- `api/src/auth/auth.service.ts`
- `api/src/users/users.controller.ts`
- `api/src/users/users.service.ts`
- `client/src/features/auth/LoginPage.tsx`
- `client/src/features/auth/RegisterPage.tsx`
- `client/src/features/profile/ProfilePage.tsx`

### 9. Advanced permissions system (+2)

Qué decir:

- Hay roles `USER` y `ADMIN`.
- El backend protege rutas con `JwtAuthGuard`, `AdminGuard` y `OwnerOrAdminGuard`.
- El panel admin permite ver/editar/eliminar usuarios, editar rol/ELO y borrar partidas.
- Hay protección para que un admin no pueda borrarse a sí mismo ni quitarse su propio rol admin.

Qué enseñar:

- Entrar a `/admin` con usuario admin.
- Probar que un usuario normal no puede acceder.
- Editar ELO/rol de otro usuario.
- Mostrar que el botón de borrar o degradar la propia cuenta está bloqueado.

Evidencia:

- `api/src/auth/guard/admin.guard.ts`
- `api/src/auth/guard/owner-or-admin.guard.ts`
- `api/src/admin/admin.controller.ts`
- `client/src/app/ProtectedAdminRoute.tsx`
- `client/src/features/admin/AdminUsers.tsx`
- `client/src/features/admin/AdminGames.tsx`

### 10. AI Opponent (+2)

Qué decir:

- Hay modo contra Stockfish.
- El usuario elige color y dificultad.
- Hay 20 niveles.
- Se añade delay para que la IA no parezca instantánea.
- El resultado se guarda con `finishGame` y alimenta estadísticas.

Qué enseñar:

- Crear partida vs IA.
- Elegir negras para demostrar que la IA juega primero.
- Cambiar nivel.
- Terminar o rendirse y comprobar que queda registrada.

Evidencia:

- `client/src/engine/stockfish.ts`
- `client/src/features/game/AIGamePage.tsx`
- `api/src/game/game.service.ts`
- `client/src/services/gameService.ts`

### 11. Juego web completo entre usuarios (+2)

Qué decir:

- El juego es ajedrez web completo con partidas online 1v1.
- Hay reglas de ajedrez mediante `chess.js`.
- Se validan movimientos, turnos, checkmate, tablas, stalemate, repetición, material insuficiente, resign y draw offers.
- El estado de la partida se persiste en base de datos.

Qué enseñar:

- Crear partida online.
- Unirse con otro usuario.
- Hacer movimientos válidos e intentar uno inválido.
- Ofrecer tablas o rendirse.
- Descargar TXT de la partida.

Evidencia:

- `client/src/features/game/Board.tsx`
- `client/src/features/game/OnlineGamePage.tsx`
- `api/src/game/game.service.ts`
- `api/src/game/game.controller.ts`
- `api/prisma/schema.prisma`

### 12. Remote players en tiempo real (+2, riesgo medio)

Qué decir:

- Dos jugadores en navegadores o equipos distintos juegan la misma partida en tiempo real.
- Socket.IO mantiene una sala por partida y emite cambios de estado a ambos clientes.
- Se contemplan errores de sala llena, estado de partida, cancelación y finalización.

Qué enseñar:

- Dos sesiones con usuarios distintos.
- Movimiento sincronizado.
- Oferta de tablas sincronizada.
- Chat entre jugadores.

Riesgo:

- El subject pide reconnection logic. El código tiene eventos de reconexión en `handleJoinGame`, pero `handleDisconnect` puede finalizar una partida en curso sin ventana de espera si el usuario pierde su única conexión.
- Para defenderlo mejor, añadir un timeout de gracia de 20-30 segundos antes de marcar la partida como perdida por desconexión.

Evidencia:

- `api/src/game/game.gateway.ts`
- `client/src/hooks/useGameSocket.ts`
- `client/src/features/game/OnlineGamePage.tsx`

### 13. Gráficos 3D avanzados (+2)

Qué decir:

- El tablero 3D usa `@react-three/fiber`, `@react-three/drei` y Three.js.
- La escena incluye cámara orbital, luces, sombras, materiales, geometría propia para piezas y temas.
- No es decorativo: el tablero 3D es jugable y usa las mismas reglas/movimientos que el tablero 2D.

Qué enseñar:

- Cambiar de vista 2D a 3D.
- Rotar la cámara.
- Mover una pieza en 3D.
- Cambiar tema 3D.

Evidencia:

- `client/src/features/game/Board3D.tsx`
- `client/src/features/game/Board.tsx`
- `client/package.json`

### 14. Game customization options (+1)

Qué decir:

- Hay personalización de vista y temas del tablero.
- Hay preferencias persistidas en localStorage.
- En IA se puede elegir color y dificultad.

Qué enseñar:

- Cambiar 2D/3D.
- Cambiar tema 2D y 3D.
- Crear partida IA, elegir color, mover dificultad.
- Salir y volver para ver preferencias persistidas.

Evidencia:

- `client/src/features/game/gameStore.ts`
- `client/src/features/game/AIGamePage.tsx`
- `client/src/features/game/OnlineGamePage.tsx`
- `client/src/features/game/Board.tsx`

### 15. Game statistics and match history (+1, riesgo bajo/medio)

Qué decir:

- El perfil muestra partidas totales, victorias, derrotas, empates, win rate y ELO.
- Hay historial reciente de partidas finalizadas.
- El admin dashboard muestra top 10 por ELO y actividad reciente.

Qué enseñar:

- Terminar una partida online o IA.
- Abrir perfil y ver contadores.
- Ver historial de partidas.
- Abrir `/admin` y mostrar ranking por ELO.

Riesgo:

- El subject menciona achievements/progression. El proyecto tiene ELO y ranking, pero no achievements explícitos.
- Si el evaluador es estricto, añadir 3 badges persistidos simples reforzaría este módulo.

Evidencia:

- `client/src/features/profile/ProfilePage.tsx`
- `api/src/users/users.service.ts`
- `api/src/game/game.service.ts`
- `client/src/features/admin/AdminDashboard.tsx`

## Módulos del README que conviene corregir

En el README actual:

- `Public API` aparece como módulo, pero no debería reclamarse hasta tener API key validada en backend y rate limiting.
- `Support for multiple languages`, `additional browsers`, `OAuth`, `data exports/imports`, `health/status` aparecen como posibles o bonus, pero no están implementados.
- `File upload` no aparece como módulo elegido, y mejor no añadirlo todavía: avatar upload ya ayuda al módulo de user management, pero no llega al módulo completo de gestión de ficheros.
- `Advanced search`, `3D graphics` y `Game customization` sí son defendibles y deberían estar en la tabla principal si vais a reclamarlos.

## Orden recomendado de demo

1. Frameworks y arquitectura general.
2. ORM y schema Prisma.
3. Auth, perfil, avatar y amigos.
4. Juego online 1v1.
5. WebSockets: movimiento, chat, tablas y game end.
6. IA con Stockfish.
7. Personalización 2D/3D, temas, color y dificultad.
8. Tablero 3D.
9. Estadísticas e historial.
10. Admin permissions.
11. Advanced search en admin.
12. Design system y notifications.

## Checklist final antes de defender

- `docker/.env` existe.
- La app levanta con `make` o `make PROD=1`.
- `client` compila con `npm run build` dentro del contenedor.
- `api` compila con `npm run build` dentro del contenedor.
- Se puede registrar un usuario nuevo.
- Hay al menos dos usuarios para demo online.
- Hay un usuario admin seed o documentado.
- La Privacy Policy está accesible.
- Añadir Terms of Service o documentar por qué falta antes de evaluar.
- README actualizado para no prometer módulos no defendibles.
