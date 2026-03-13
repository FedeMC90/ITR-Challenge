# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install netcat for health checks and wait scripts
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for migrations and seeders that require compilation)
# We need devDependencies to run nest build commands for seeds
RUN npm ci

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy necessary source files for migrations and seeders
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.build.json ./tsconfig.build.json
COPY --from=builder /app/nest-cli.json ./nest-cli.json

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Start application
CMD ["npm", "run", "start:prod"]
