FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo

# Prune the monorepo for backend
FROM base AS builder
COPY . .
RUN turbo prune backend --docker

# Install dependencies
FROM base AS installer
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=builder /app/out/full/ .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=installer /app/packages/backend/dist ./dist
COPY --from=installer /app/packages/backend/package.json .
COPY --from=installer /app/packages/backend/prisma ./prisma

# Install production dependencies
RUN npm install --production
RUN npx prisma generate

EXPOSE 8080
CMD ["node", "dist/index.js"]