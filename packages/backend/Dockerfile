FROM node:20-alpine AS base

# Install OpenSSL
RUN apk add --no-cache openssl openssl-dev

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
RUN npm run prisma:generate
EXPOSE 8080
CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]