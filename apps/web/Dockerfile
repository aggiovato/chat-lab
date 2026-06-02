# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
# Compiles the Angular app in production mode
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install frontend deps only
RUN npm install --workspace=apps/web --ignore-scripts

# Copy frontend source and configuration files
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/angular.json \
     apps/web/tsconfig.json \
     apps/web/tsconfig.app.json \
     ./apps/web/

# Production build (outputPath: dist/web/browser/)
RUN npm --workspace=apps/web run build


# ─── Stage 2: Production ──────────────────────────────────────────────────────
# nginx serves static files and proxies requests to the API
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/apps/web/dist/web/browser /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
