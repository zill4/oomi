FROM rust:latest as builder

# Install build dependencies
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# First, create a dummy project and build dependencies
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Now copy the real source code
COPY . .

# Build the application with real source
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/bin

# Copy the built binary
COPY --from=builder /usr/src/app/target/release/resume-parser .

# Copy config files
COPY --from=builder /usr/src/app/config ./config

CMD ["resume-parser"]