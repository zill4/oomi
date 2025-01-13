# Build stage for frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
# Install all dependencies including dev dependencies for building
RUN npm install

# Copy only the files needed for the frontend build
COPY turbo.json ./
COPY packages/frontend ./packages/frontend
RUN npm run build -w packages/frontend

# Frontend production stage
FROM nginx:alpine AS frontend
COPY --from=frontend-builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
# Add default nginx config if it doesn't exist
RUN [ -f /etc/nginx/conf.d/default.conf ] || echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80

# Build stage for backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
# Install all dependencies including dev dependencies for building
RUN npm install

# Copy only the files needed for the backend build
COPY turbo.json ./
COPY packages/backend ./packages/backend
# Install TypeScript globally in the builder stage
RUN npm install -g typescript
RUN npm run build -w packages/backend

# Backend production stage
FROM node:20-alpine AS backend
WORKDIR /app

# Install OpenSSL and PostgreSQL client
RUN apk add --no-cache openssl postgresql-client

COPY --from=backend-builder /app/packages/backend/dist ./dist
COPY --from=backend-builder /app/packages/backend/package.json ./package.json
# Copy Prisma schema and generate client
COPY --from=backend-builder /app/packages/backend/prisma ./prisma

# Install dependencies and generate Prisma client
RUN npm install
RUN npx prisma generate

ENV NODE_OPTIONS="--experimental-specifier-resolution=node"

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["node", "dist/index.js"]

# Add wait-for-it script
COPY packages/backend/wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh