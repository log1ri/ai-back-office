# ---- Build stage ----
FROM oven/bun:1.2.18 AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies with bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . ./

# Build the application
RUN bun run build

# ---- Runtime stage ----
# Production dependencies only — no devDependencies (nest cli, swc, typescript,
# jest, eslint, ...) or source in the final image, only compiled dist/.
FROM oven/bun:1.2.18-alpine AS runtime
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production \
    && rm -rf /root/.bun/install/cache

COPY --from=builder /app/dist ./dist

EXPOSE 5167
ENV NODE_ENV=production
ENV PORT=5167

CMD ["bun", "run", "dist/main.js"]
