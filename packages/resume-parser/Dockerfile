FROM rust:1.83 as builder

WORKDIR /usr/src/app

# Copy the Cargo files first
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release

# Now copy the actual source code
COPY . .

# Build again with actual source
RUN cargo build --release

FROM debian:bookworm-slim

# Install necessary runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the built binary
COPY --from=builder /usr/src/app/target/release/resume-parser /app/resume-parser

# Copy configuration
COPY config /app/config/

ENV RUST_LOG=info

CMD ["./resume-parser"] 