# Node.js base
FROM node:20-alpine AS node-base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copy root workspace files first
COPY package.json package-lock.json turbo.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies including Turbo
RUN npm install
RUN npm install -g turbo

# Build backend
FROM node-base AS node-builder
COPY . .
RUN npx turbo build --filter=backend...

# Rust builder - using latest rust image
FROM rust:latest AS rust-builder
WORKDIR /app/resume-parser

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY packages/resume-parser .
RUN cargo build --release

# Final stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy Node.js build artifacts
COPY --from=node-builder /app/packages/backend/dist ./dist
COPY --from=node-builder /app/packages/backend/package.json .
COPY --from=node-builder /app/packages/backend/prisma ./prisma

# Install runtime dependencies for Rust binary
RUN apk add --no-cache \
    libgcc \
    libssl3 \
    ca-certificates

# Copy Rust binary
COPY --from=rust-builder /app/resume-parser/target/release/resume-parser /usr/local/bin/

# Install production dependencies
RUN npm install --production
RUN npx prisma generate

# Create a startup script
COPY <<-"EOF" /usr/local/bin/start.sh
#!/bin/sh
node dist/index.js & 
resume-parser & 
wait
EOF

RUN chmod +x /usr/local/bin/start.sh

EXPOSE 8080 3001
CMD ["/usr/local/bin/start.sh"]