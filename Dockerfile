# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json turbo.json ./
COPY packages/frontend/package.json ./packages/frontend/
RUN npm install
COPY packages/frontend ./packages/frontend
RUN npm run build -w packages/frontend

# Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app

# Install OpenSSL and other required dependencies
RUN apk add --no-cache openssl openssl-dev libc6-compat

COPY package.json turbo.json ./
COPY packages/backend/package.json ./packages/backend/
RUN npm install
COPY packages/backend ./packages/backend

# Build backend
RUN npm run build -w packages/backend

# Production image
FROM node:20-alpine
WORKDIR /app

# Install OpenSSL and other required dependencies
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Copy backend package.json and install production dependencies
COPY packages/backend/package.json ./
RUN npm install --production

# Copy backend build artifacts
COPY --from=backend-builder /app/packages/backend/dist ./dist
COPY --from=backend-builder /app/packages/backend/prisma ./prisma

# Generate Prisma Client in production environment
RUN npx prisma generate

# Copy frontend build artifacts to serve statically
COPY --from=frontend-builder /app/packages/frontend/dist ./public

EXPOSE 8080
CMD ["node", "dist/server.js"]
