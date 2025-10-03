# Use Bun official image for best compatibility
FROM oven/bun:1.2.18 as base
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies with bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . ./

# Build the application
RUN bun run build

# Expose port (default NestJS port)
EXPOSE 5167
ENV NODE_ENV=production
ENV PORT=5167
# ENV HOSTNAME "0.0.0.0"

# Start the application with Bun
CMD ["bun", "run", "dist/main.js"]
