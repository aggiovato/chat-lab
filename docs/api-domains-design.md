# Chat Lab API — Diseño inicial de dominios y modelos

> Proyecto: **Chat Lab**  
> Backend: **NestJS**  
> Frontend previsto: **Angular 21**  
> Persistencia prevista: **PostgreSQL + Prisma**  
> Tiempo real: **WebSockets / Socket.IO**  
> Objetivo del documento: servir como guía base para crear los módulos, carpetas, modelos y relaciones principales de la API.

---

## 1. Criterio arquitectónico elegido

La API se organizará por **dominios funcionales**. Cada dominio tendrá su propia carpeta con controladores, servicios, DTOs y, si aplica, clases auxiliares.

Estructura recomendada por dominio:

```txt
domain/
├─ controllers/
│  └─ domain.controller.ts
├─ dto/
│  ├─ create-domain.dto.ts
│  ├─ update-domain.dto.ts
│  └─ domain-response.dto.ts
├─ services/
│  └─ domain.service.ts
├─ entities/
│  └─ domain.entity.ts
├─ domain.module.ts
└─ index.ts
```

### Nota sobre `entities/` usando Prisma

Con Prisma, los modelos reales de base de datos viven en:

```txt
prisma/schema.prisma
```

Por eso, en esta arquitectura `entities/` **no representa necesariamente entidades ORM** como en TypeORM. Puede usarse para:

- clases de respuesta;
- tipos de dominio;
- modelos internos no persistentes;
- documentación de estructura;
- entidades conceptuales;
- helpers de serialización.

Si se quiere una arquitectura más simple, se puede omitir `entities/` al inicio y usar:

```txt
domain/
├─ controllers/
├─ dto/
├─ services/
└─ domain.module.ts
```

---

## 2. Estructura inicial de `src/`

```txt
src/
├─ app.module.ts
├─ main.ts
├─ config/
│  ├─ app.config.ts
│  └─ validation.config.ts
├─ common/
│  ├─ decorators/
│  ├─ filters/
│  ├─ guards/
│  ├─ interceptors/
│  ├─ pipes/
│  ├─ types/
│  └─ utils/
├─ prisma/
│  ├─ prisma.module.ts
│  └─ prisma.service.ts
├─ auth/
│  ├─ controllers/
│  ├─ dto/
│  ├─ guards/
│  ├─ strategies/
│  ├─ services/
│  └─ auth.module.ts
├─ users/
│  ├─ controllers/
│  ├─ dto/
│  ├─ services/
│  ├─ entities/
│  └─ users.module.ts
├─ conversations/
│  ├─ controllers/
│  ├─ dto/
│  ├─ services/
│  ├─ entities/
│  └─ conversations.module.ts
├─ messages/
│  ├─ controllers/
│  ├─ dto/
│  ├─ services/
│  ├─ entities/
│  └─ messages.module.ts
├─ realtime/
│  ├─ gateways/
│  ├─ dto/
│  ├─ services/
│  └─ realtime.module.ts
├─ commands/
│  ├─ controllers/
│  ├─ dto/
│  ├─ handlers/
│  ├─ interfaces/
│  ├─ services/
│  └─ commands.module.ts
├─ attachments/
│  ├─ controllers/
│  ├─ dto/
│  ├─ services/
│  └─ attachments.module.ts
└─ health/
   ├─ controllers/
   ├─ services/
   └─ health.module.ts
```

---

## 3. Dominios base

### 3.1 `auth`

Responsabilidad: autenticación, registro, login, emisión de tokens y validación de usuario autenticado.

No debería encargarse de la lógica general de usuarios. Esa lógica pertenece a `users`.

#### Controllers

```txt
auth/
└─ controllers/
   └─ auth.controller.ts
```

#### Endpoints iniciales

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/refresh
POST /api/auth/logout
```

#### DTOs principales

```txt
auth/dto/
├─ register.dto.ts
├─ login.dto.ts
├─ refresh-token.dto.ts
└─ auth-response.dto.ts
```

#### Servicios

```txt
auth/services/
├─ auth.service.ts
├─ password.service.ts
└─ token.service.ts
```

#### Relación con otros dominios

```txt
auth -> users
auth -> prisma
```

`auth` necesita consultar y crear usuarios, pero la propiedad del modelo `User` pertenece a `users`.

---

### 3.2 `users`

Responsabilidad: perfil de usuario, búsqueda de usuarios, actualización de datos públicos y estado general del usuario.

#### Controllers1

```txt
users/
└─ controllers/
   └─ users.controller.ts
```

#### Endpoints iniciales1

```txt
GET   /api/users/me
PATCH /api/users/me
GET   /api/users/search?query=
GET   /api/users/:id
```

#### DTOs principales1

```txt
users/dto/
├─ update-user.dto.ts
├─ user-response.dto.ts
└─ user-search-query.dto.ts
```

#### Servicios1

```txt
users/services/
└─ users.service.ts
```

#### Modelo relacionado

```txt
User
```

#### Relaciones

```txt
User 1:N Message
User N:M Conversation mediante ConversationMember
User 1:N MessageReaction
User 1:N MessageReadReceipt
```

---

### 3.3 `conversations`

Responsabilidad: creación y gestión de conversaciones. Una conversación puede ser directa, grupal o canal.

Se recomienda usar el nombre `conversations` en lugar de `chats`, porque `chat` puede referirse tanto al sistema completo como a una conversación concreta.

#### Controllers2

```txt
conversations/
└─ controllers/
   ├─ conversations.controller.ts
   └─ conversation-members.controller.ts
```

Separar miembros en otro controller ayuda a evitar un controlador demasiado grande.

#### Endpoints iniciales2

```txt
GET    /api/conversations
POST   /api/conversations/direct
POST   /api/conversations/group
GET    /api/conversations/:conversationId
PATCH  /api/conversations/:conversationId

GET    /api/conversations/:conversationId/members
POST   /api/conversations/:conversationId/members
DELETE /api/conversations/:conversationId/members/:userId
```

#### DTOs principales2

```txt
conversations/dto/
├─ create-direct-conversation.dto.ts
├─ create-group-conversation.dto.ts
├─ update-conversation.dto.ts
├─ add-conversation-member.dto.ts
├─ conversation-response.dto.ts
└─ conversation-member-response.dto.ts
```

#### Servicios2

```txt
conversations/services/
├─ conversations.service.ts
└─ conversation-members.service.ts
```

#### Modelos relacionados

```txt
Conversation
ConversationMember
```

#### Relaciones2

```txt
Conversation 1:N Message
Conversation 1:N ConversationMember
ConversationMember N:1 User
ConversationMember N:1 Conversation
```

#### Reglas iniciales

```txt
DIRECT:
  - conversación entre 2 usuarios.
  - no debería duplicarse una conversación directa entre los mismos usuarios.

GROUP:
  - conversación con 2 o más usuarios.
  - puede tener título.
  - puede tener roles: OWNER, ADMIN, MEMBER.

CHANNEL:
  - reservado para futuro.
```

---

### 3.4 `messages`

Responsabilidad: creación, consulta, edición, borrado lógico, lectura y reacciones de mensajes.

Aunque los mensajes se envíen por WebSocket, debe existir API HTTP para histórico, paginación y operaciones no necesariamente realtime.

#### Controllers3

```txt
messages/
└─ controllers/
   ├─ messages.controller.ts
   ├─ message-reactions.controller.ts
   └─ message-read-receipts.controller.ts
```

#### Endpoints iniciales3

```txt
GET    /api/conversations/:conversationId/messages
POST   /api/conversations/:conversationId/messages
PATCH  /api/messages/:messageId
DELETE /api/messages/:messageId

POST   /api/messages/:messageId/read
POST   /api/messages/:messageId/reactions
DELETE /api/messages/:messageId/reactions/:emoji
```

#### DTOs principales3

```txt
messages/dto/
├─ send-message.dto.ts
├─ update-message.dto.ts
├─ message-response.dto.ts
├─ message-list-query.dto.ts
├─ add-message-reaction.dto.ts
└─ mark-message-read.dto.ts
```

#### Servicios3

```txt
messages/services/
├─ messages.service.ts
├─ message-reactions.service.ts
└─ message-read-receipts.service.ts
```

#### Modelos relacionados3

```txt
Message
MessageReaction
MessageReadReceipt
```

#### Relaciones3

```txt
Message N:1 Conversation
Message N:1 User como sender
Message 1:N MessageAttachment
Message 1:N MessageReaction
Message 1:N MessageReadReceipt
```

#### Tipos de mensajes

```txt
TEXT
COMMAND
SYSTEM
IMAGE
AUDIO
FILE
STICKER
```

#### Reglas iniciales3

```txt
- Solo miembros de una conversación pueden enviar mensajes.
- Solo el autor puede editar un mensaje.
- El borrado debe ser lógico mediante deletedAt.
- Los mensajes tipo COMMAND pueden generar respuestas tipo SYSTEM o COMMAND_RESULT.
```

---

### 3.5 `realtime`

Responsabilidad: comunicación WebSocket, conexión de sockets, rooms, eventos de mensajes, escritura, lectura y presencia básica.

Este módulo no debería tener demasiada lógica de negocio. Debe delegar en:

```txt
messages
conversations
commands
users
```

#### Gateways

```txt
realtime/
└─ gateways/
   └─ chat.gateway.ts
```

#### Servicios4

```txt
realtime/services/
├─ realtime.service.ts
├─ socket-auth.service.ts
└─ presence.service.ts
```

#### DTOs principales4

```txt
realtime/dto/
├─ join-conversation.dto.ts
├─ leave-conversation.dto.ts
├─ send-socket-message.dto.ts
├─ typing.dto.ts
└─ socket-error.dto.ts
```

#### Eventos cliente → servidor

```txt
chat:join
chat:leave
message:send
message:edit
message:delete
message:read
typing:start
typing:stop
```

#### Eventos servidor → cliente

```txt
chat:joined
chat:left
message:new
message:updated
message:deleted
message:read
typing:update
presence:update
error
```

#### Rooms

Cada conversación debe usar una room:

```txt
conversation:{conversationId}
```

Ejemplo:

```txt
conversation:8e80b29a-d2fd-4cf7-8d0b-9fa0c9063c78
```

#### Reglas iniciales4

```txt
- El socket debe autenticarse con JWT.
- El socket debe guardar el usuario autenticado en socket.data.user.
- Antes de hacer join a una room, se debe validar que el usuario pertenece a la conversación.
- El gateway no debe crear mensajes directamente en Prisma; debe llamar a MessagesService.
```

---

### 3.6 `commands`

Responsabilidad: detectar, registrar y ejecutar comandos del chat como `/joke`, `/gpt`, `/help`, `/ping`.

Este módulo permite que el chat sea extensible.

#### Controllers5

```txt
commands/
└─ controllers/
   └─ commands.controller.ts
```

#### Endpoints iniciales5

```txt
GET  /api/commands
POST /api/commands/preview
```

`GET /api/commands` puede servir para que Angular muestre autocompletado cuando el usuario escriba `/`.

#### Servicios5

```txt
commands/services/
├─ command-parser.service.ts
├─ command-registry.service.ts
└─ commands.service.ts
```

#### Interfaces

```txt
commands/interfaces/
├─ chat-command.interface.ts
├─ command-context.interface.ts
└─ command-result.interface.ts
```

#### Handlers iniciales

```txt
commands/handlers/
├─ help.command.ts
├─ ping.command.ts
└─ joke.command.ts
```

#### Handlers futuros

```txt
commands/handlers/
├─ gpt.command.ts
├─ weather.command.ts
├─ translate.command.ts
├─ poll.command.ts
└─ reminder.command.ts
```

#### Flujo de ejecución

```txt
1. Usuario envía un mensaje.
2. MessagesService detecta si empieza por "/".
3. CommandParserService extrae nombre y argumentos.
4. CommandRegistryService busca el handler.
5. El handler ejecuta la acción.
6. MessagesService guarda el mensaje original y/o la respuesta generada.
7. Realtime emite el resultado a la conversación.
```

#### Ejemplo

```txt
Input:
  /joke

Command:
  joke

Args:
  []

Output:
  Mensaje generado por el sistema con un chiste.
```

---

### 3.7 `attachments`

Responsabilidad: gestión futura de archivos adjuntos, imágenes, audios, documentos y stickers.

No es necesario implementarlo en el MVP, pero conviene reservar el dominio.

#### Controllers6

```txt
attachments/
└─ controllers/
   └─ attachments.controller.ts
```

#### Endpoints futuros

```txt
POST   /api/attachments/upload
GET    /api/attachments/:attachmentId
DELETE /api/attachments/:attachmentId
```

#### DTOs futuros

```txt
attachments/dto/
├─ create-attachment.dto.ts
├─ attachment-response.dto.ts
└─ upload-attachment.dto.ts
```

#### Servicios6

```txt
attachments/services/
├─ attachments.service.ts
└─ storage.service.ts
```

#### Modelo relacionado6

```txt
MessageAttachment
```

#### Reglas futuras

```txt
- Validar mime type.
- Validar tamaño máximo.
- Asociar attachment a un mensaje.
- Soportar storage local en desarrollo.
- Preparar storage S3-compatible a futuro.
```

---

### 3.8 `health`

Responsabilidad: endpoint simple para comprobar que la API está viva.

#### Controllers7

```txt
health/
└─ controllers/
   └─ health.controller.ts
```

#### Endpoints

```txt
GET /api/health
```

#### Respuesta esperada

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

---

## 4. Modelos Prisma iniciales

El archivo de modelos irá en:

```txt
apps/api/prisma/schema.prisma
```

### 4.1 `User`

Representa un usuario registrado en el sistema.

```prisma
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  username     String     @unique
  displayName  String?
  passwordHash String
  avatarUrl    String?
  status       UserStatus @default(OFFLINE)

  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  memberships  ConversationMember[]
  messages     Message[]
  reactions    MessageReaction[]
  readReceipts MessageReadReceipt[]
}
```

### 4.2 `Conversation`

Representa una conversación directa, grupal o canal.

```prisma
model Conversation {
  id        String           @id @default(uuid())
  type      ConversationType
  title     String?
  imageUrl  String?

  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  members   ConversationMember[]
  messages  Message[]
}
```

### 4.3 `ConversationMember`

Representa la pertenencia de un usuario a una conversación.

```prisma
model ConversationMember {
  id             String     @id @default(uuid())
  conversationId String
  userId         String
  role           MemberRole @default(MEMBER)

  joinedAt       DateTime   @default(now())
  muted          Boolean    @default(false)
  archived       Boolean    @default(false)

  conversation   Conversation @relation(fields: [conversationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])

  @@unique([conversationId, userId])
}
```

### 4.4 `Message`

Representa un mensaje dentro de una conversación.

```prisma
model Message {
  id             String      @id @default(uuid())
  conversationId String
  senderId       String?

  type           MessageType @default(TEXT)
  content        String?
  commandName    String?
  metadata       Json?

  replyToId      String?

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  editedAt       DateTime?
  deletedAt      DateTime?

  conversation   Conversation @relation(fields: [conversationId], references: [id])
  sender         User?        @relation(fields: [senderId], references: [id])

  attachments    MessageAttachment[]
  reactions      MessageReaction[]
  readReceipts   MessageReadReceipt[]
}
```

### 4.5 `MessageAttachment`

Representa un archivo asociado a un mensaje.

```prisma
model MessageAttachment {
  id        String   @id @default(uuid())
  messageId String

  url       String
  mimeType  String
  fileName  String?
  size      Int?

  createdAt DateTime @default(now())

  message   Message  @relation(fields: [messageId], references: [id])
}
```

### 4.6 `MessageReaction`

Representa una reacción de un usuario a un mensaje.

```prisma
model MessageReaction {
  id        String   @id @default(uuid())
  messageId String
  userId    String
  emoji     String

  createdAt DateTime @default(now())

  message   Message  @relation(fields: [messageId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([messageId, userId, emoji])
}
```

### 4.7 `MessageReadReceipt`

Representa la marca de lectura de un mensaje por parte de un usuario.

```prisma
model MessageReadReceipt {
  id        String   @id @default(uuid())
  messageId String
  userId    String
  readAt    DateTime @default(now())

  message   Message  @relation(fields: [messageId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([messageId, userId])
}
```

### 4.8 `CommandInvocation`

Representa el historial técnico de ejecución de comandos.

```prisma
model CommandInvocation {
  id             String   @id @default(uuid())
  conversationId String
  userId         String
  commandName    String
  input          String?
  output         Json?
  success        Boolean
  error          String?

  createdAt      DateTime @default(now())
}
```

---

## 5. Enums iniciales

```prisma
enum UserStatus {
  ONLINE
  OFFLINE
  AWAY
}
```

```prisma
enum ConversationType {
  DIRECT
  GROUP
  CHANNEL
}
```

```prisma
enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}
```

```prisma
enum MessageType {
  TEXT
  COMMAND
  SYSTEM
  IMAGE
  AUDIO
  FILE
  STICKER
}
```

---

## 6. Relaciones principales

```txt
User
 ├─ tiene muchos Message como sender
 ├─ pertenece a muchas Conversation mediante ConversationMember
 ├─ tiene muchas MessageReaction
 └─ tiene muchas MessageReadReceipt

Conversation
 ├─ tiene muchos ConversationMember
 └─ tiene muchos Message

ConversationMember
 ├─ pertenece a un User
 └─ pertenece a una Conversation

Message
 ├─ pertenece a una Conversation
 ├─ puede tener un User como sender
 ├─ puede tener muchos MessageAttachment
 ├─ puede tener muchas MessageReaction
 └─ puede tener muchas MessageReadReceipt

CommandInvocation
 ├─ registra comandos ejecutados por User
 └─ registra comandos ejecutados dentro de Conversation
```

---

## 7. Orden recomendado de creación de módulos

### Paso 1: estructura común

```txt
common
config
health
```

### Paso 2: persistencia

```txt
prisma
```

### Paso 3: autenticación y usuarios

```txt
auth
users
```

### Paso 4: conversaciones y mensajes

```txt
conversations
messages
```

### Paso 5: tiempo real

```txt
realtime
```

### Paso 6: comandos

```txt
commands
```

### Paso 7: adjuntos

```txt
attachments
```

---

## 8. Comandos Nest CLI sugeridos

Desde `apps/api`:

```bash
nest g module health
nest g controller health/controllers/health --flat
nest g service health/services/health --flat
```

```bash
nest g module prisma
nest g service prisma/prisma --flat
```

```bash
nest g module auth
nest g controller auth/controllers/auth --flat
nest g service auth/services/auth --flat
nest g service auth/services/password --flat
nest g service auth/services/token --flat
```

```bash
nest g module users
nest g controller users/controllers/users --flat
nest g service users/services/users --flat
```

```bash
nest g module conversations
nest g controller conversations/controllers/conversations --flat
nest g controller conversations/controllers/conversation-members --flat
nest g service conversations/services/conversations --flat
nest g service conversations/services/conversation-members --flat
```

```bash
nest g module messages
nest g controller messages/controllers/messages --flat
nest g controller messages/controllers/message-reactions --flat
nest g controller messages/controllers/message-read-receipts --flat
nest g service messages/services/messages --flat
nest g service messages/services/message-reactions --flat
nest g service messages/services/message-read-receipts --flat
```

```bash
nest g module realtime
nest g gateway realtime/gateways/chat --flat
nest g service realtime/services/realtime --flat
nest g service realtime/services/socket-auth --flat
nest g service realtime/services/presence --flat
```

```bash
nest g module commands
nest g controller commands/controllers/commands --flat
nest g service commands/services/commands --flat
nest g service commands/services/command-parser --flat
nest g service commands/services/command-registry --flat
```

```bash
nest g module attachments
nest g controller attachments/controllers/attachments --flat
nest g service attachments/services/attachments --flat
nest g service attachments/services/storage --flat
```

---

## 9. Controllers principales y propósito

| Dominio | Controller | Propósito |

|---|---|---|
| `health` | `HealthController` | Comprobar estado básico de la API |
| `auth` | `AuthController` | Registro, login, usuario autenticado y refresh |
| `users` | `UsersController` | Perfil, búsqueda y actualización de usuarios |
| `conversations` | `ConversationsController` | Crear, listar y consultar conversaciones |
| `conversations` | `ConversationMembersController` | Gestionar miembros de conversaciones |
| `messages` | `MessagesController` | Histórico, creación, edición y borrado de mensajes |
| `messages` | `MessageReactionsController` | Añadir y eliminar reacciones |
| `messages` | `MessageReadReceiptsController` | Marcar mensajes como leídos |
| `commands` | `CommandsController` | Listar comandos disponibles y previsualización |
| `attachments` | `AttachmentsController` | Subida y consulta de adjuntos futuros |

---

## 10. Servicios principales y propósito

| Dominio | Service | Propósito |

|---|---|---|
| `prisma` | `PrismaService` | Cliente Prisma compartido |
| `auth` | `AuthService` | Casos de uso de autenticación |
| `auth` | `PasswordService` | Hash y verificación de contraseñas |
| `auth` | `TokenService` | Generación y validación de tokens |
| `users` | `UsersService` | Consultas y operaciones de usuarios |
| `conversations` | `ConversationsService` | Gestión de conversaciones |
| `conversations` | `ConversationMembersService` | Validar y modificar miembros |
| `messages` | `MessagesService` | Crear, listar, editar y borrar mensajes |
| `messages` | `MessageReactionsService` | Gestionar reacciones |
| `messages` | `MessageReadReceiptsService` | Gestionar lecturas |
| `realtime` | `RealtimeService` | Emisión de eventos a rooms |
| `realtime` | `SocketAuthService` | Autenticación de conexiones WebSocket |
| `realtime` | `PresenceService` | Estado online/offline/typing |
| `commands` | `CommandsService` | Orquestar comandos |
| `commands` | `CommandParserService` | Parsear texto `/command args` |
| `commands` | `CommandRegistryService` | Registrar y resolver handlers |
| `attachments` | `AttachmentsService` | Gestión lógica de adjuntos |
| `attachments` | `StorageService` | Abstracción de almacenamiento |

---

## 11. Dependencias entre módulos

```txt
AuthModule
 ├─ UsersModule
 └─ PrismaModule

UsersModule
 └─ PrismaModule

ConversationsModule
 ├─ UsersModule
 └─ PrismaModule

MessagesModule
 ├─ ConversationsModule
 ├─ CommandsModule
 └─ PrismaModule

RealtimeModule
 ├─ AuthModule / TokenService
 ├─ ConversationsModule
 ├─ MessagesModule
 └─ CommandsModule

CommandsModule
 └─ PrismaModule

AttachmentsModule
 ├─ MessagesModule
 └─ PrismaModule
```

Para evitar dependencias circulares:

```txt
- Realtime debe depender de Messages, pero Messages no debería depender directamente de Realtime.
- Si Messages necesita emitir eventos, puede devolver el resultado al Gateway o usar un servicio de eventos interno más adelante.
- Commands puede ser usado por Messages, pero los comandos no deberían depender de Messages salvo que sea estrictamente necesario.
```

---

## 12. Flujo principal: enviar mensaje HTTP

```txt
1. Cliente llama POST /api/conversations/:conversationId/messages
2. JwtAuthGuard valida usuario
3. MessagesController recibe SendMessageDto
4. MessagesService valida membresía con ConversationsService
5. MessagesService detecta si es texto normal o comando
6. Si es texto normal:
   - crea Message
   - devuelve MessageResponseDto
7. Si es comando:
   - llama CommandsService
   - guarda Message tipo COMMAND y/o SYSTEM
   - devuelve resultado
```

---

## 13. Flujo principal: enviar mensaje WebSocket

```txt
1. Cliente conecta socket con JWT
2. SocketAuthService valida el token
3. ChatGateway guarda user en socket.data.user
4. Cliente emite chat:join con conversationId
5. Gateway valida membresía
6. Gateway añade socket a room conversation:{conversationId}
7. Cliente emite message:send
8. Gateway llama MessagesService
9. MessagesService crea mensaje o ejecuta comando
10. Gateway emite message:new a la room
```

---

## 14. Flujo principal: comando `/joke`

```txt
1. Usuario envía: /joke
2. MessagesService detecta prefijo "/"
3. CommandParserService obtiene:
   - commandName: joke
   - args: []
4. CommandRegistryService busca JokeCommand
5. JokeCommand devuelve CommandResult
6. Se registra CommandInvocation
7. Se crea un Message tipo SYSTEM o COMMAND
8. Se emite message:new a la conversación
```

---

## 15. Decisiones iniciales

```txt
- Usar Prisma como ORM.
- Usar DTOs manuales con class-validator.
- No exponer modelos Prisma directamente en controllers.
- Usar Response DTOs o mappers para salida.
- Usar UUID como identificador principal.
- Usar soft delete en mensajes mediante deletedAt.
- Separar conversaciones y mensajes.
- Separar commands del módulo messages.
- Separar realtime de la lógica de negocio.
```

---

## 16. MVP exacto de API

La primera versión funcional debe permitir:

```txt
1. GET /api/health
2. Registro de usuario
3. Login
4. Obtener usuario autenticado
5. Buscar usuarios
6. Crear conversación directa
7. Crear conversación grupal
8. Listar mis conversaciones
9. Listar mensajes de una conversación
10. Enviar mensaje HTTP
11. Conectar por WebSocket
12. Unirse a conversación por WebSocket
13. Enviar mensaje realtime
14. Ejecutar /ping
15. Ejecutar /joke
```

---

## 17. Funcionalidades fuera del MVP

No implementar todavía:

```txt
- subida real de imágenes;
- audios;
- stickers;
- streaming de GPT;
- notificaciones push;
- Redis adapter;
- Docker production;
- roles avanzados;
- moderación;
- cifrado end-to-end;
- llamadas;
- bots complejos.
```

---

## 18. Primera tarea real después de este documento

Crear las carpetas y módulos en este orden:

```txt
1. health
2. common
3. config
4. prisma
5. auth
6. users
7. conversations
8. messages
9. realtime
10. commands
11. attachments
```

Primer commit recomendado:

```bash
git add .
git commit -m "docs(api): add initial domain design"
```

Segundo commit recomendado tras generar módulos:

```bash
git add .
git commit -m "feat(api): add base domain modules"
```
