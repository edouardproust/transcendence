# EVALUACIÓN DE SOLUCIONES Y PROPUESTAS NUEVAS
## Proyecto Transcendence - 2026-04-08

---

## 1. EVALUACIÓN DE SOLUCIONES PROPUESTAS ANTERIORMENTE

### 1.1 Solución Propuesta: Presencia Online (Opción A - Contador de Sockets)

**En el informe.md se proponía:**
```typescript
// api/src/game/game.gateway.ts
@WebSocketGateway({...})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private userSocketCount = new Map<string, number>();
  private socketUserMap = new Map<string, string>();

  async handleConnection(client: Socket) {
    const user = this.verifyToken(client);
    const count = (this.userSocketCount.get(user.sub) || 0) + 1;
    this.userSocketCount.set(user.sub, count);
    this.socketUserMap.set(client.id, user.sub);
    
    if (count === 1) {
      this.server.emit('user_status', {
        userId: user.sub,
        is_online: true,
        last_seen: new Date().toISOString(),
      });
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;
    
    this.socketUserMap.delete(client.id);
    const count = (this.userSocketCount.get(userId) || 1) - 1;
    this.userSocketCount.set(userId, count);
    
    if (count <= 0) {
      this.userSocketCount.delete(userId);
      await this.usersService.updateOneById(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      this.server.emit('user_status', {
        userId,
        is_online: false,
        last_seen: new Date().toISOString(),
      });
    }
  }
}
```

**Evaluación:** ✅ VIABLE Y RECOMENDADA

**Ventajas:**
- Maneja correctamente múltiples pestañas del mismo usuario
- No depende de logout manual
- Emite eventos para que el frontend actualice los badges

**Inconvenientes:**
- Requiere modificar el guard para extraer el usuario del token JWT en la conexión
- Necesita integrar UsersService en el módulo del gateway

---

### 1.2 Solución Propuesta: Presencia Online (Opción B - Boolean Simple)

**En el informe.md se proponía:**
```typescript
// api/src/auth/auth.controller.ts - logout
@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(@CurrentUser() user: RequestUser) {
  await this.usersService.updateOneById(user.id, {
    isOnline: false,
    lastSeen: new Date(),
  });
  return { message: 'Logged out' };
}

// api/src/game/game.gateway.ts - handleDisconnect
async handleDisconnect(client: Socket) {
  try {
    await this.usersService.updateOneById(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });
  } catch (e) {
    console.error('Error updating user online status:', e);
  }
}
```

**Evaluación:** ⚠️ PARCIALMENTE VIABLE

**Problemas:**
- Si el usuario abre múltiples pestañas, desconectar una no debería marcarlo offline
- No emite eventos `user_status` al frontend
- El frontend no sabrá cuándo actualizar los badges

**Veredicto:** Usar Opción A. La Opción B es insuficiente.

---

### 1.3 Solución Propuesta: CORS WebSocket Configurable

**En el informe.md se proponía:**
```typescript
// api/src/game/game.gateway.ts
@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN
      ? process.env.WS_CORS_ORIGIN.split(',')
      : ['http://localhost:8080', 'https://localhost:8443'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
```

**Evaluación:** ✅ VIABLE Y SIMPLE

**Recomendación:** Añadir también validación del origen en producción:
```typescript
const allowedOrigins = process.env.WS_CORS_ORIGIN?.split(',') || 
  ['http://localhost:8080', 'https://localhost:8443'];

@WebSocketGateway({
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
```

---

### 1.4 Solución Propuesta: Estado ABORTED en Frontend

**En el informe.md se proponía:**
```typescript
// client/src/services/gameService.ts
const normalizeGameStatus = (status: string | null | undefined): Game['status'] => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'ongoing') return 'active';
  if (normalized === 'finished') return 'finished';
  if (normalized === 'cancelled' || normalized === 'aborted') return 'cancelled';
  return 'waiting';
};
```

**Evaluación:** ✅ VIABLE

También debe aplicarse en `client/src/hooks/useGameSocket.ts:10-17`.

---

### 1.5 Solución Propuesta: Validación de Registro (Frontend)

**En el informe.md se proponía:**
```tsx
<Input
  label="Contraseña"
  type="password"
  minLength={12}
  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>/?\\|[\]~`]).*"
  title="Debe contener al menos 12 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos"
/>
```

**Evaluación:** ⚠️ INCOMPLETA

**Problema:** El patrón regex en el attribute `pattern` de HTML puede no funcionar correctamente en todos los navegadores.

**Mejor enfoque:** Validación JavaScript en el handleSubmit:
```typescript
const validatePassword = (password: string): string | null => {
  if (password.length < 12) {
    return 'La contraseña debe tener al menos 12 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una minúscula';
  }
  if (!/\d/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }
  if (!/[!@#$%^&*()\-_=+{};:,<.>/?\\|[\]~`]/.test(password)) {
    return 'La contraseña debe contener al menos un símbolo';
  }
  return null;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const passwordError = validatePassword(password);
  if (passwordError) {
    setError(passwordError);
    return;
  }
  // ... resto del código
};
```

---

### 1.6 Solución Propuesta: Tipos de Socket Completos

**En el informe.md se proponía:**
```typescript
// client/src/types/socket.ts
export interface ServerToClientEvents {
  gameUpdate: (data: GameUpdateData) => void;
  gameEnd: (data: GameEndData) => void;
  gameCancelled: () => void;
  error: (message: string) => void;
  playerJoined: (data: { playerId: string; color: 'white' | 'black' }) => void;
  playerDisconnected: (data: { playerId: string }) => void;
  playerReconnected: (data: { playerId: string }) => void;
  drawOffered: (data: { playerId: string }) => void;
  drawAccepted: () => void;
  drawDeclined: (data: { playerId: string }) => void;
  chatMessage: (data: { userId: string; username: string; message: string; timestamp: string }) => void;
  userStatus: (data: { userId: string; is_online: boolean; last_seen: string }) => void;
}

export interface ClientToServerEvents {
  joinGame: (data: { gameId: string }) => void;  // Cambiado de string a objeto
  resign: (gameId: string) => void;
  cancelGame: (gameId: string) => void;
  offerDraw: (gameId: string) => void;
  acceptDraw: (gameId: string) => void;
  declineDraw: (gameId: string) => void;
  chatMessage: (data: { gameId: string; message: string }) => void;
  ping: () => void;
}
```

**Evaluación:** ✅ VIABLE Y NECESARIA

**Problema adicional detectado:** El payload mismatch en `joinGame`:
- Tipo actual: `joinGame: (gameId: string) => void`
- Código usado: `socket.emit('joinGame', { gameId })`

La solución propuesta lo corrige correctamente.

---

## 2. SOLUCIONES PARA PROBLEMAS NO DETECTADOS ANTERIORMENTE

### 2.1 API Key Sin Validación en Backend

**Problema:** El frontend envía `x-api-key` pero no se valida en el backend.

**Solución Opción A: Implementar validación (RECOMENDADA)**

```typescript
// api/src/common/filters/api-key.filter.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKeys: Set<string>;

  constructor() {
    const apiKeys = process.env.VALID_API_KEYS || 'dev-api-key-change-me';
    this.validApiKeys = new Set(apiKeys.split(','));
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || !this.validApiKeys.has(apiKey as string)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
```

Aplicar a nivel global en main.ts o en rutas específicas.

**Solución Opción B: Eliminar la API key (MÁS SIMPLE)**

Si no es necesaria para seguridad, eliminarla del frontend:
```typescript
// client/src/services/api.ts - eliminar
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Eliminar: 'x-api-key': API_KEY,
  },
});
```

**Evaluación:** La Opción B es preferible si no hay requisito de seguridad real.

---

### 2.2 Self-Friend-Request

**Problema:** No hay validación para impedir que un usuario se envíe solicitud a sí mismo.

**Solución:**

```typescript
// api/src/friends/friends.service.ts - sendRequest
async sendRequest(
  senderId: string,
  dto: SendFriendRequestDto,
): Promise<FriendRequestResponseDto> {
  // Añadir esta validación
  if (senderId === dto.receiverId) {
    throw new BadRequestException('Cannot send friend request to yourself');
  }

  // ... resto del código existente
}
```

También agregar filtro en el frontend:
```typescript
// client/src/features/profile/ProfilePage.tsx
const handleAddFriend = (targetUserId: string) => {
  const currentUserId = user?.id;
  
  if (targetUserId === currentUserId) {
    alert('No puedes enviarte solicitud a ti mismo');
    return;
  }
  
  // ... envío de solicitud
};
```

---

### 2.3 Manejo de Errores WebSocket Inconsistente

**Problema:** Los errores de WebSocket se manejan de forma inconsistente. Algunos usan `client.emit('error', { message: ... })` y otros muestran alerts directamente en el frontend.

**Solución:** Estandarizar manejo de errores en el gateway:

```typescript
// api/src/game/game.gateway.ts
private emitError(client: Socket, message: string, code?: string) {
  client.emit('error', { 
    message, 
    code: code || 'GAME_ERROR',
    timestamp: new Date().toISOString(),
  });
}

// En cada handler:
@UseGuards(WsJwtGuard)
@SubscribeMessage('cancelGame')
async handleCancelGame(
  @MessageBody() gameId: string,
  @ConnectedSocket() client: Socket,
) {
  try {
    await this.gameService.cancelGame(gameId, userId);
    this.server.to(room).emit('gameCancelled');
  } catch (error) {
    this.emitError(client, error.message, 'CANCEL_ERROR');
  }
}
```

---

### 2.4 Ausencia de Logging Estructurado

**Problema:** El logging es inconsistente y no estructurado. Algunos `console.log`, otros sin nada.

**Solución:** Usar un logger estructurado:

```typescript
// api/src/game/game.gateway.ts
import { Logger } from '@nestjs/common';

@WebSocketGateway({...})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // ... resto del código
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(...) {
    this.logger.debug(`User ${userId} joining game ${gameId}`);
    // ... resto del código
  }
}
```

---

### 2.5 Falta de Validación en el Payload de Chat

**Problema:** El mensaje de chat no tiene validación de longitud o contenido.

**Solución:**

```typescript
// En game.gateway.ts - handleChatMessage
@SubscribeMessage('chatMessage')
async handleChatMessage(
  @MessageBody() data: { gameId: string; message: string },
  @ConnectedSocket() client: Socket,
) {
  const MAX_MESSAGE_LENGTH = 500;
  const message = data.message?.trim();

  if (!message) {
    this.emitError(client, 'Message cannot be empty', 'EMPTY_MESSAGE');
    return;
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    this.emitError(client, `Message too long (max ${MAX_MESSAGE_LENGTH} chars)`, 'MESSAGE_TOO_LONG');
    return;
  }

  // ... resto del código
}
```

---

### 2.6 No Hay Handling de Timeout de Conexión

**Problema:** Si un usuario pierde conectividad pero el socket no se desconecta inmediatamente, el oponente ve "playerDisconnected" con retraso.

**Solución:** Implementar heartbeat/ping-pong:

```typescript
// En game.gateway.ts
@UseGuards(WsJwtGuard)
@SubscribeMessage('ping')
async handlePing(@ConnectedSocket() client: Socket) {
  const user = client.data.user;
  client.emit('pong', {
    userId: user.sub,
    timestamp: Date.now(),
  });
}

// En el frontend - useGameSocket.ts
useEffect(() => {
  // ... setup existente
  
  const pingInterval = setInterval(() => {
    if (socket?.connected) {
      socket.emit('ping');
    }
  }, 30000); // Cada 30 segundos

  socket.on('pong', () => {
    // Connection is alive
  });

  return () => clearInterval(pingInterval);
}, [gameId, token]);
```

---

## 3. RESUMEN DE VIABILIDAD DE SOLUCIONES

| Problema | Solución Propuesta | Viabilidad |
|----------|-------------------|-------------|
| Presencia Online | Opción A - Contador de sockets | ✅ VIABLE |
| Presencia Online | Opción B - Boolean simple | ⚠️ Insuficiente |
| CORS WebSocket | Variable de entorno | ✅ VIABLE |
| Estado ABORTED | normalizeGameStatus | ✅ VIABLE |
| Validación Password | JS en handleSubmit | ✅ VIABLE |
| Tipos Socket | Completar definiciones | ✅ VIABLE |
| API Key | Eliminar o validar | ✅ VIABLE |
| Self-friend-request | Validación backend + frontend | ✅ VIABLE |
| Manejo de Errores | Estandarizar emitError | ✅ VIABLE |
| Chat Validation | Validar longitud | ✅ VIABLE |
| Timeout de Conexión | Heartbeat ping-pong | ✅ VIABLE |

---

## 4. PRIORIDADES RECOMENDADAS

### Inmediato (Esta semana)
1. Corregir logout para actualizar `isOnline: false`
2. Corregir handleDisconnect para actualizar `isOnline: false`
3. Añadir `'aborted'` a normalizeGameStatus

### Corto plazo (Próxima semana)
4. Implementar contador de sockets para presencia online
5. Hacer CORS configurable
6. Completar tipos Socket
7. Añadir validación de password en frontend

### Medio plazo
8. Implementar heartbeat para detección de desconexión
9. Estandarizar manejo de errores
10. Añadir validación de longitud en chat
11. Corregir self-friend-request
