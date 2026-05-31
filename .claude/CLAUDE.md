# Chat Lab — Descripción del proyecto

## ¿Qué es Chat Lab?

Chat Lab es una aplicación de chat en tiempo real construida como proyecto de aprendizaje y experimentación. Permite comunicación directa entre usuarios, conversaciones grupales y comandos de chat extensibles.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend API | NestJS (Node.js + TypeScript) |
| Frontend | Angular 21 |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Tiempo real | WebSockets / Socket.IO |
| Autenticación | JWT (access + refresh tokens) |

## Estructura del monorepo

```
chat-lab/
├── apps/
│   ├── api/        ← NestJS API (backend)
│   └── web/        ← Angular (frontend, aún no iniciado)
├── docs/           ← Documentación y diagramas PlantUML
├── package.json    ← npm workspaces raíz
└── .claude/        ← Contexto para Claude Code
```

## Gestión de dependencias

El proyecto usa **npm workspaces**. Todos los `node_modules` se instalan en la raíz.

```bash
# Instalar todas las dependencias
npm install

# Ejecutar comandos por workspace
npm --workspace apps/api run start:dev
npm --workspace apps/api run test
npm --workspace apps/web run start
```

## Scripts raíz disponibles

```bash
npm run api:dev      # Levanta la API en modo watch
npm run api:build    # Compila la API
npm run api:test     # Corre los tests de la API
npm run web:dev      # Levanta el frontend
npm run web:build    # Compila el frontend
npm run web:test     # Corre los tests del frontend
```

## Documentación

- `docs/api-domains-design.md` — diseño completo de dominios, modelos y decisiones arquitectónicas
- `docs/diagrams/er/` — diagramas ER en PlantUML
- `docs/diagrams/classes/` — diagramas de clases por dominio en PlantUML

## Estado del proyecto

El proyecto está en construcción activa. El MVP debe cubrir:
registro, login, conversaciones directas y grupales, mensajes HTTP y WebSocket, y comandos básicos (`/ping`, `/joke`).
