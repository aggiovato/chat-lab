# Chat Lab API — Arquitectura y convenciones

## Stack

NestJS · TypeScript · Prisma · PostgreSQL · Socket.IO · JWT

El esquema Prisma vive en `apps/api/prisma/schema.prisma` (aún no creado).

---

## Estructura de `src/`

```
src/
├── core/            ← infraestructura técnica, sin lógica de negocio
│   ├── prisma/      ← PrismaService compartido
│   ├── config/      ← configuración de la app (variables de entorno)
│   └── health/      ← endpoint GET /api/health
├── common/          ← utilidades transversales reutilizables
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── types/
│   └── utils/
└── modules/         ← dominios de negocio de la aplicación
    ├── auth/
    ├── users/
    ├── conversations/
    ├── messages/
    ├── realtime/
    ├── commands/
    └── attachments/
```

---

## Estructura interna de cada módulo

```
domain/
├── controllers/
│   └── domain.controller.ts     ← un archivo por controller
├── services/
│   └── domain.service.ts        ← un archivo por service
├── dto/
│   ├── create-domain.dto.ts
│   ├── update-domain.dto.ts
│   └── domain-response.dto.ts
├── entities/                    ← opcional: tipos de dominio, no entidades ORM
├── domain.module.ts
└── index.ts                     ← barrel export (opcional)
```

Cada controller va en **su propio archivo** dentro de `controllers/`.
Cada controller tiene su archivo `.spec.ts` en la misma carpeta.
Cada service tiene su archivo `.spec.ts` en la misma carpeta.

---

## Módulos y sus dependencias

```
core/prisma     ← base, sin dependencias internas
core/health     ← sin dependencias internas

modules/auth    ← depende de: users, prisma
modules/users   ← depende de: prisma
modules/conversations ← depende de: users, prisma
modules/messages      ← depende de: conversations, commands, prisma
modules/realtime      ← depende de: auth (TokenService), conversations, messages, commands
modules/commands      ← depende de: prisma
modules/attachments   ← depende de: messages, prisma
```

Para evitar dependencias circulares:
- `realtime` depende de `messages`, pero `messages` **no** depende de `realtime`
- `commands` puede ser usado por `messages`, pero los handlers no deben depender de `messages`

---

## Convenciones de código

### Controllers
- Nunca acceden a Prisma directamente — siempre a través de un Service
- No contienen lógica de negocio
- Reciben DTOs validados con `class-validator`
- Retornan Response DTOs, nunca modelos Prisma crudos

### Services
- Contienen toda la lógica de negocio
- Son los únicos que llaman a `PrismaService`
- Pueden llamar a otros Services de otros módulos exportados

### DTOs
- Validados con `class-validator` y `class-transformer`
- Organizados en subcarpetas: `dto/requests/` para entrada y `dto/responses/` para salida, cuando existen ambos tipos
- Los Response DTOs deben omitir campos sensibles (e.g. `passwordHash`)
- Los Response DTOs que mapean desde un modelo Prisma usan un constructor explícito para controlar qué campos se exponen

### Mensajes de error
- **Todos los mensajes de error lanzados con excepciones NestJS deben estar en inglés** (`NotFoundException`, `ConflictException`, `UnauthorizedException`, `ForbiddenException`, etc.)
- Los mensajes de log (`Logger`) también en inglés
- Ejemplo correcto: `throw new NotFoundException('User not found')`
- Ejemplo incorrecto: `throw new NotFoundException('Usuario no encontrado')`

### Comentarios en services
- No agregar comentarios que describan lo que hace el código — los nombres de métodos ya lo dicen
- **Sí agregar comentarios** cuando exista lógica de negocio no obvia: una restricción de dominio, una regla que podría sorprender, o una decisión deliberada que parece un error
- Formato: una sola línea sobre el bloque relevante
- Ejemplo válido:
  ```typescript
  // Deduplicate: creator is added explicitly as OWNER, skip if already in memberIds
  const memberIds = [...new Set([userId, ...dto.memberIds])];
  ```

### Identificadores
- Todos los modelos usan `UUID` como clave primaria (`@default(uuid())`)

### Borrado lógico
- Los mensajes se borran con `deletedAt` (soft delete), nunca con `DELETE` de base de datos

### Autenticación
- HTTP: `JwtAuthGuard` en cada endpoint protegido
- WebSocket: `SocketAuthService` valida el JWT en la conexión y guarda el usuario en `socket.data.user`

---

## Tests

- Cada controller y service tiene su archivo `.spec.ts` en la misma carpeta
- Los tests unitarios mockean las dependencias (services, PrismaService)
- Los tests e2e viven en `test/` en la raíz de `apps/api/`
- Comando: `npm --workspace apps/api run test`

---

## Prefijo global

Todos los endpoints tienen el prefijo `/api` configurado en `main.ts` con `app.setGlobalPrefix('api')`.

---

## Diagramas de referencia

Los diagramas de arquitectura y ER están en `docs/diagrams/` en la raíz del monorepo.
Ver `docs/api-domains-design.md` para el diseño completo de dominios.
