# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos frecuentes

```bash
# Instalar dependencias (siempre desde la raíz)
npm install

# API — desarrollo, build, tests
npm run api:dev          # NestJS en modo watch
npm run api:build        # Compila a dist/
npm run api:test         # Jest unitario

# Frontend — desarrollo, build, tests
npm run web:dev          # Angular dev server
npm run web:build        # Build de producción
npm run web:test         # Karma/Jasmine

# Correr un solo test unitario (API)
npm --workspace apps/api run test -- --testPathPattern="auth.service"

# Correr tests con cobertura (API)
npm --workspace apps/api run test:cov

# Tests e2e (API)
npm --workspace apps/api run test:e2e

# Lint + formato (API)
npm --workspace apps/api run lint
npm --workspace apps/api run format

# Prisma
npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
npx prisma generate    --schema=apps/api/prisma/schema.prisma
npx prisma studio      --schema=apps/api/prisma/schema.prisma
```

## Arquitectura general

Monorepo con npm workspaces (`apps/api` y `apps/web`). Todos los `node_modules` se instalan en la raíz.

```
chat-lab/
├── apps/
│   ├── api/        ← NestJS 11 + Prisma + Socket.IO
│   └── web/        ← Angular 21 + NgRx
├── docs/           ← Diseño de dominios y diagramas PlantUML
└── package.json    ← workspaces raíz + scripts de conveniencia
```

---

## Backend (`apps/api`)

### Estructura

```
src/
├── core/
│   ├── prisma/      ← PrismaService global (exportado para todos los módulos)
│   ├── config/      ← Variables de entorno tipadas
│   └── health/      ← GET /api/health
├── common/          ← Guards, interceptors, pipes, decorators, filtros reutilizables
└── modules/         ← Dominios de negocio
    ├── auth/        ← Login, registro, JWT (access + refresh)
    ├── users/
    ├── conversations/
    ├── messages/    ← HTTP CRUD + soft-delete (deletedAt)
    ├── realtime/    ← WebSocket gateway (Socket.IO)
    ├── commands/    ← Comandos de chat (/ping, /joke, etc.)
    └── attachments/
```

### Dependencias entre módulos

```
auth         → users, prisma
users        → prisma
conversations → users, prisma
messages     → conversations, commands, prisma
realtime     → auth (TokenService), conversations, messages, commands
attachments  → messages, prisma
```

`realtime` depende de `messages`, pero `messages` **no** depende de `realtime` (evitar circular).

### Reglas clave

- Todos los endpoints tienen prefijo `/api` (configurado en `main.ts`).
- HTTP protegido con `JwtAuthGuard`; WebSocket valida JWT en conexión (guarda usuario en `socket.data.user`).
- Controllers nunca acceden a Prisma directamente; solo llaman Services.
- Response DTOs nunca exponen `passwordHash` ni modelos Prisma crudos.
- **Los mensajes de error de excepciones NestJS van en inglés** (`throw new NotFoundException('User not found')`).
- Todos los IDs son UUID (`@default(uuid())`).
- Borrado de mensajes: soft delete con `deletedAt`, nunca `DELETE` en base de datos.

### Variables de entorno (`.env` en `apps/api/`)

```
DATABASE_URL=""           # conexión pooled (runtime)
DATABASE_URL_UNPOOLED=""  # conexión directa (migraciones Prisma)
JWT_ACCESS_SECRET=""
JWT_REFRESH_SECRET=""
```

### Tests

- Archivo `.spec.ts` junto al controller o service que prueba.
- Tests unitarios mockean todas las dependencias (Services, PrismaService).
- Tests e2e en `apps/api/test/` con `jest-e2e.json`.

---

## Frontend (`apps/web`)

### Estructura

```
src/app/
├── core/
│   ├── interceptors/  ← authInterceptor añade Bearer token a cada request HTTP
│   ├── guards/        ← authGuard usa store NgRx (selectIsAuthenticated)
│   └── services/      ← StorageService (tokens en localStorage)
├── common/components/ ← componentes reutilizables entre dominios
└── domains/
    ├── auth/
    └── conversations/
```

Cada dominio sigue la misma estructura interna:

```
domain/
├── models/          ← interfaces TypeScript puras
├── services/        ← solo HTTP, sin estado
├── store/           ← actions, reducer, selectors, effects (NgRx)
└── pages/           ← componentes standalone, sin sufijo .component
```

### Reglas clave

- Componentes siempre **standalone** con `imports: [...]` en el decorador.
- Archivos de componente sin sufijo `.component` (ej: `login.ts`, `conversation-list.ts`).
- Leer estado del store con `store.selectSignal(selector)` — nunca suscribirse manualmente en componentes.
- **Las llamadas HTTP van exclusivamente en Effects** — nunca en componentes ni en reducers.
- Services son HTTP puros: reciben parámetros, devuelven `Observable<T>`.
- Routing con lazy loading por dominio (`loadChildren` / `loadComponent`); `withComponentInputBinding()` activo.
- Formularios con `ReactiveFormsModule`; submit despacha una NgRx action, nunca llama al service directamente.
- Estado de `auth` registrado globalmente en `app.config.ts`; estado de `conversations` en rutas (lazy).
- URL base de la API: `environment.apiUrl`.

---

## Documentación de referencia

- `docs/api-domains-design.md` — diseño completo de dominios, modelos y decisiones arquitectónicas
- `docs/diagrams/er/` — diagramas ER (PlantUML)
- `docs/diagrams/classes/` — diagramas de clases por dominio (PlantUML)
- `apps/api/.claude/CLAUDE.md` — convenciones detalladas del backend
- `apps/web/.claude/CLAUDE.md` — convenciones detalladas del frontend
