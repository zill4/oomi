# Build stage
FROM rust:1.83-slim-bullseye AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY packages/resume-parser/Cargo.toml ./Cargo.toml

# Create dummy source and build dependencies
RUN mkdir -p src && \
    echo 'fn main() { println!("Initializing resume-parser..."); }' > src/main.rs

RUN cargo build --release

# Remove the dummy source and built files
RUN rm -rf src target/release/deps/resume_parser*

# Copy actual source code
COPY packages/resume-parser/src ./src

# Build the actual binary
RUN cargo build --release

# Runtime stage
FROM debian:bullseye-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary from builder
COPY --from=builder /app/target/release/resume-parser .

# Expose the port the server listens on
EXPOSE 3001

# Run the binary
CMD ["./resume-parser"] 