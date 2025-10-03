# Use Bun official image for best compatibility
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


EXPOSE 5173
ENV HOST=0.0.0.0
CMD ["bunx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
