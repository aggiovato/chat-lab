# Chat Lab Web — Arquitectura y convenciones

## Stack

Angular 21 · TypeScript · NgRx (store + effects + entity) · RxJS

---

## Estructura de `src/app/`

```
src/app/
├── core/              ← infraestructura técnica: interceptors, guards, servicios base
│   ├── interceptors/  ← authInterceptor añade Bearer token a cada request HTTP
│   ├── guards/        ← authGuard protege rutas usando el store de NgRx
│   └── services/      ← StorageService (localStorage para tokens)
├── common/
│   └── components/    ← componentes reutilizables entre dominios
└── domains/           ← un dominio por feature/página principal
    ├── auth/
    └── conversations/
```

---

## Estructura interna de cada dominio

```
domain/
├── models/
│   └── domain.models.ts       ← interfaces TypeScript (sin clases)
├── services/
│   └── domain.service.ts      ← solo HTTP, sin estado
├── store/
│   ├── domain.state.ts        ← interfaces de estado + initialState + EntityAdapter si aplica
│   ├── domain.actions.ts      ← createActionGroup con events
│   ├── domain.reducer.ts      ← createReducer con on()
│   ├── domain.selectors.ts    ← createFeatureSelector + createSelector
│   └── domain.effects.ts      ← todas las llamadas HTTP van aquí
└── pages/
    └── page-name/
        └── page-name.ts       ← componente standalone, sin sufijo .component
```

---

## Convenciones de código

### Componentes
- Siempre standalone (`imports: [...]` en el decorador)
- Sin sufijo `.component` en el nombre de archivo ni en la clase
- Signal-first: leer estado del store con `store.selectSignal(selector)`
- Nunca suscribirse manualmente al store en componentes — usar signals o `async` pipe

### Store (NgRx)
- **Las llamadas HTTP van exclusivamente en Effects** — nunca en componentes ni en el reducer
- Services son HTTP puros: reciben parámetros, devuelven `Observable<T>`, sin estado
- Usar `createActionGroup` para agrupar acciones relacionadas
- Usar `@ngrx/entity` para colecciones (listas de conversaciones, mensajes, etc.)
- El estado de `conversations` se registra con `provideState()` en las rutas (lazy)
- El estado de `auth` se registra en `app.config.ts` (global, necesario para el guard)

### Routing
- Lazy loading por dominio con `loadChildren` + `loadComponent`
- `withComponentInputBinding()` activo — los route params llegan como `input()`
- El guard (`authGuard`) selecciona `selectIsAuthenticated` del store global de auth

### Formularios
- Usar `ReactiveFormsModule` con `FormGroup` + `FormControl`
- Usar `{ nonNullable: true }` en todos los FormControls
- El submit despacha una NgRx action — nunca llama al service directamente

### Naming
- Archivos: `kebab-case.ts` (ej: `conversation-list.ts`, `auth.effects.ts`)
- Clases: `PascalCase` sin sufijos innecesarios (ej: `Login`, `ConversationList`)
- Actions: `createActionGroup` con `source: 'FeatureName'`

---

## Variables de entorno

Definidas en `src/environments/environment.ts` y `environment.prod.ts`.
La URL base de la API es `environment.apiUrl`.

---

## Levantar el proyecto

```bash
# Desde la raíz del monorepo (requiere Node 20+)
npm run web:dev

# O directamente desde apps/web
npm start
```
