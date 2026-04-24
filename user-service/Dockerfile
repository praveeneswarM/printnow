# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy from builder
COPY --from=builder /app ./

# Setup permissions for uploads (especially for document-service)
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 5001
CMD ["node", "index.js"]