# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Nginx (Non-Root)
FROM nginx:alpine

# Configure nginx permissions for non-root execution
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R 777 /var/cache/nginx /var/run /var/log/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Switch to standard nginx user (already exists in alpine)
USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]