# Chess 42 - Guía de Defensa de Módulos

Este documento resume **qué módulos conviene defender hoy**, **cuántos puntos suman** y **cómo explicarlos durante la evaluación**.

## Total recomendado

- **Puntos defendibles hoy: 24**
- **Total recomendado de defensa**: `24 puntos`

## Módulos que sí conviene defender

| Categoría | Módulo | Tipo | Puntos |
| --- | --- | --- | --- |
| Web | Use a framework for both frontend and backend | Major | +2 |
| Web | Allow users to interact with other users | Major | +2 |
| Web | Use an ORM for the database | Minor | +1 |
| Gaming and UX | Complete web-based game where users can play against each other | Major | +2 |
| Gaming and UX | Remote players in real-time | Major | +2 |
| User Management | Standard user management and authentication | Major | +2 |
| Web | Implement real-time features using WebSockets | Major | +2 |
| Web | Custom-made design system with reusable components | Minor | +1 |
| Web | A complete notification system for CRUD actions | Minor | +1 |
| Gaming and UX | AI Opponent | Major | +2 |
| User Management | Advanced permissions system | Major | +2 |
| Gaming and UX | Game customization options | Minor | +1 |
| Web | Advanced search functionality with filters, sorting, and pagination | Minor | +1 |
| User Management | Game statistics and match history | Minor | +1 |
| Gaming and UX | Advanced 3D graphics | Major | +2 |

**Total: 24 puntos**

---

## 1. Framework frontend + backend (+2)

**Qué decir**
- El frontend está hecho con **React + Vite**.
- El backend está hecho con **NestJS**.
- La aplicación está separada en capas claras: UI, servicios, sockets, controladores y servicios backend.

**Qué enseñar**
- Estructura de `client/` y `api/`
- Navegación frontend y Swagger/backend

**Evidencia**
- `client/src/main.tsx`
- `api/src/main.ts`

---

## 2. User interaction (+2)

**Qué decir**
- Los usuarios pueden interactuar entre sí mediante **perfil**, **amistades** y **chat en partida**.
- También se ve el **estado online** de amigos.

**Qué enseñar**
- Buscar usuarios desde perfil
- Enviar solicitud de amistad
- Aceptar/rechazar solicitud
- Chat dentro de una partida online

**Evidencia**
- `client/src/features/profile/ProfilePage.tsx`
- `api/src/friends/friends.controller.ts`
- `client/src/features/game/OnlineGamePage.tsx`
- `api/src/game/game.gateway.ts`

---

## 3. ORM (+1)

**Qué decir**
- Se usa **Prisma ORM** sobre PostgreSQL.
- El modelo incluye usuarios, partidas, amistades y solicitudes.

**Qué enseñar**
- `schema.prisma`
- Relaciones `User`, `Game`, `FriendRequest`, `Friendship`

**Evidencia**
- `api/prisma/schema.prisma`

---

## 4. Complete web-based game (+2)

**Qué decir**
- El juego implementado es **ajedrez web completo**.
- Hay validación de movimientos, turnos, jaque mate, tablas, rendición y exportación de la partida.

**Qué enseñar**
- Crear partida online
- Jugar varias jugadas válidas
- Ofrecer tablas o rendirse
- Exportar TXT

**Evidencia**
- `client/src/features/game/Board.tsx`
- `client/src/features/game/OnlineGamePage.tsx`
- `api/src/game/game.service.ts`

---

## 5. Remote players in real-time (+2)

**Qué decir**
- Dos jugadores remotos comparten el mismo estado de partida en tiempo real.
- Se gestionan reconexiones, sala llena, cancelación y finalización sincronizada.

**Qué enseñar**
- Dos navegadores en la misma partida
- Movimiento de un jugador reflejado al instante
- Mensaje al desconectar/reconectar

**Evidencia**
- `client/src/hooks/useGameSocket.ts`
- `api/src/game/game.gateway.ts`

---

## 6. Standard user management and authentication (+2)

**Qué decir**
- Registro, login, sesión persistida, perfil editable, avatar, amigos y estado online.
- El usuario puede entrar con **email o username**.

**Qué enseñar**
- Register / login
- Editar perfil
- Subir avatar
- Ver perfil propio y ajeno

**Evidencia**
- `client/src/features/auth/LoginPage.tsx`
- `client/src/features/auth/RegisterPage.tsx`
- `client/src/features/profile/ProfilePage.tsx`
- `api/src/auth/auth.controller.ts`
- `api/src/users/users.controller.ts`

---

## 7. Real-time features with WebSockets (+2)

**Qué decir**
- Los WebSockets no se usan solo para el tablero: también cubren chat, estado de partida, reconexión y eventos de tablas.

**Qué enseñar**
- `gameUpdate`
- `gameEnd`
- `drawOffered`
- `chatMessage`

**Evidencia**
- `client/src/hooks/useGameSocket.ts`
- `api/src/game/game.gateway.ts`

---

## 8. Custom-made design system (+1)

**Qué decir**
- Se creó una base de UI reusable con **tokens compartidos** y **más de 10 componentes reutilizables**.
- Incluye paleta, tipografía, iconos, superficies y componentes comunes.

**Qué enseñar**
- `Button`, `Input`, `Card`, `Modal`, `Avatar`, `Badge`, `Spinner`, `Icon`, `ToastProvider`, `Navbar`, `Layout`, `GameHeader`, `GameLayout`
- Archivo de tokens y documentación

**Evidencia**
- `client/src/components/ui/designSystem.ts`
- `client/src/components/ui/Button.tsx`
- `client/src/components/ui/Input.tsx`
- `client/src/components/ui/Card.tsx`
- `client/src/components/ui/Modal.tsx`
- `client/src/components/ui/ToastProvider.tsx`
- `docs/design-system.md`

**Frase útil**
- “No es solo una colección de componentes: hay reglas compartidas de paleta, tipografía, radios y sombras reutilizadas en toda la app.”

---

## 9. Complete notification system for CRUD actions (+1)

**Qué decir**
- Las acciones de creación, actualización y borrado relevantes se notifican con **toasts** consistentes.
- Hay tonos distintos para éxito, error e información.

**Qué enseñar**
- Crear partida
- Actualizar perfil
- Subir avatar
- Enviar/aceptar/rechazar amistad
- Admin: editar usuario, borrar usuario, borrar partida

**Evidencia**
- `client/src/components/ui/ToastProvider.tsx`
- `client/src/features/profile/ProfilePage.tsx`
- `client/src/features/lobby/LobbyPage.tsx`
- `client/src/features/admin/AdminUsers.tsx`
- `client/src/features/admin/AdminGames.tsx`

---

## 10. AI Opponent (+2)

**Qué decir**
- Hay modo contra **Stockfish** con **20 niveles**, elección de color y persistencia de preferencias.
- Los resultados se guardan y cuentan para estadísticas del perfil.

**Qué enseñar**
- Crear partida vs IA
- Elegir blancas o negras
- Cambiar dificultad
- Terminar una partida y comprobar que el perfil refleja el resultado

**Evidencia**
- `client/src/engine/stockfish.ts`
- `client/src/features/game/AIGamePage.tsx`
- `api/src/game/game.service.ts`
- `api/src/users/users.service.ts`

**Frase útil**
- “La IA no es un mock del frontend: el usuario elige color y dificultad, y el resultado queda integrado en las estadísticas.”

---

## 11. Advanced permissions system (+2)

**Qué decir**
- Existe rol `ADMIN` con vistas y acciones diferenciadas.
- El panel admin permite **ver, editar y eliminar usuarios**, además de gestionar partidas.
- Se añadieron protecciones para no borrar la propia cuenta ni quitarse el propio rol admin.

**Qué enseñar**
- Entrar a `/admin`
- Gestión de usuarios
- Gestión de partidas
- Intentar editar la propia cuenta admin y mostrar restricciones

**Evidencia**
- `api/src/auth/guard/admin.guard.ts`
- `client/src/app/ProtectedAdminRoute.tsx`
- `api/src/admin/admin.controller.ts`
- `client/src/features/admin/AdminUsers.tsx`
- `client/src/features/admin/AdminGames.tsx`

---

## 12. Game customization options (+1)

**Qué decir**
- La personalización del juego incluye **vista 2D/3D**, **temas de tablero**, **color del jugador** y **nivel IA**.
- Las preferencias se guardan entre partidas.

**Qué enseñar**
- Cambiar 2D / 3D
- Cambiar tema
- Elegir color en IA
- Cambiar nivel IA
- Salir y volver a entrar para ver que las preferencias persisten

**Evidencia**
- `client/src/features/game/gameStore.ts`
- `client/src/features/game/AIGamePage.tsx`
- `client/src/features/game/OnlineGamePage.tsx`

---

## 13. Advanced search (+1)

**Qué decir**
- El panel admin ya no tiene solo búsqueda: ahora combina **search + filter + sorting + pagination**.
- Eso cubre lo que pide el módulo en usuarios y partidas.

**Qué enseñar**
- Buscar usuario por nombre o email
- Ordenar por ELO, rol o fecha
- Cambiar orden asc/desc
- En partidas, combinar filtro por estado con ordenación

**Evidencia**
- `api/src/admin/dtos/admin-users-query.dto.ts`
- `api/src/admin/dtos/admin-games-query.dto.ts`
- `api/src/admin/admin.service.ts`
- `client/src/services/adminService.ts`
- `client/src/features/admin/AdminUsers.tsx`
- `client/src/features/admin/AdminGames.tsx`

---

## 14. Game statistics and match history (+1)

**Qué decir**
- El perfil del usuario muestra **estadísticas persistidas**: partidas totales, victorias, derrotas, empates, win rate y ELO.
- También muestra un **historial reciente de partidas finalizadas**, distinguiendo modo online o IA, color jugado y resultado.
- La app ya integra una forma de leaderboard con el bloque de top players del panel admin.

**Qué enseñar**
- Entrar al perfil del usuario
- Mostrar los contadores de estadísticas
- Enseñar las últimas partidas finalizadas
- Abrir admin dashboard y enseñar el ranking de top players

**Evidencia**
- `client/src/features/profile/ProfilePage.tsx`
- `client/src/services/gameService.ts`
- `api/src/game/game.service.ts`
- `api/src/users/users.service.ts`
- `client/src/features/admin/AdminDashboard.tsx`

**Frase útil**
- “No mostramos solo números agregados: el perfil combina estadísticas persistidas con historial reciente de partidas y el proyecto ya expone un ranking de jugadores.”

---

## 15. Advanced 3D graphics (+2)

**Qué decir**
- El proyecto incluye un **tablero 3D interactivo** hecho con **Three.js** a través de `@react-three/fiber` y `@react-three/drei`.
- La escena usa **cámara orbital**, **luces**, **sombras**, **materiales**, **piezas 3D propias** y temas visuales.
- El usuario puede alternar entre vista 2D y 3D sin salir del flujo de juego.

**Qué enseñar**
- Cambiar de 2D a 3D desde la interfaz del juego
- Mover cámara y rotar el tablero
- Mostrar sombras, materiales y diferencia entre temas visuales

**Evidencia**
- `client/src/features/game/Board3D.tsx`
- `client/src/features/game/Board.tsx`
- `client/package.json`

**Frase útil**
- “No es un efecto decorativo: hay una escena 3D jugable integrada en el tablero, con rendering en tiempo real, control de cámara y geometría específica de las piezas.”

---

## Módulos que no conviene prometer todavía

### Public API (+2)
**No recomendar defenderlo** si no vais a cerrar antes:
- validación fuerte de API key,
- rate limiting real,
- contrato claramente documentado y pensado como API pública.

---

## Orden recomendado para defender en evaluación

1. Framework frontend + backend
2. ORM
3. Auth + perfil + avatar + amigos
4. Juego online completo
5. Tiempo real con WebSockets
6. Vs IA
7. Panel admin y permisos
8. Personalización del juego
9. Advanced search
10. Match history y estadísticas
11. Tablero 3D
12. Design system
13. Notificaciones

---

## Resumen final

- **Total defendible recomendado hoy: 24 puntos**
- **Módulos que conviene dejar fuera todavía:** Public API
