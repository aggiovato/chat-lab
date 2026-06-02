# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
# Installs all dependencies and compiles TypeScript
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace manifests (both required for npm workspaces resolution)
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install API deps only (--ignore-scripts because Prisma schema hasn't been copied yet)
RUN npm install --workspace=apps/api --ignore-scripts

# Copy Prisma schema and generate the client
COPY apps/api/prisma ./apps/api/prisma
RUN cd apps/api && npx prisma generate

# Copy API source and build configuration files
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json \
     apps/api/tsconfig.build.json \
     apps/api/nest-cli.json \
     ./apps/api/

# Build
RUN npm --workspace=apps/api run build


# ─── Stage 2: Test ────────────────────────────────────────────────────────────
# Reuses builder stage (includes devDeps, source, and compiled output)
FROM builder AS test
WORKDIR /app/apps/api
CMD ["npm", "test"]


# ─── Stage 3: Production ──────────────────────────────────────────────────────
# Minimal image: production deps only + compiled dist
FROM node:22-alpine AS production
WORKDIR /app/apps/api

# Install API production deps only (no workspace context needed)
COPY apps/api/package.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy the generated Prisma runtime from the builder
# (.prisma holds the generated client that @prisma/client resolves at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled output and Prisma schema
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "dist/main"]
