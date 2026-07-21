# ---- Build stage ----
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
# Install dependencies with bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . ./

# Build the application directly with Vite (skip TypeScript type-checking during Docker build)
RUN bunx vite build

# ---- Runtime stage ----
# Static build output only — no Bun/Node/node_modules/source in the final image.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# Backend origin nginx proxies /api/* to. Override at runtime (docker run -e / compose environment)
# to point at the real backend when it isn't the docker-compose service named "api".
ENV BACKEND_ORIGIN=http://api:5167

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
