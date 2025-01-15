# Build stage
FROM rust:1.75-slim as builder

# Install minimal build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Set cargo build parameters for memory optimization
ENV CARGO_NET_GIT_FETCH_WITH_CLI=true
ENV CARGO_BUILD_JOBS=1
ENV RUSTFLAGS="-C codegen-units=1"

WORKDIR /usr/src/app

# Copy only dependency files first
COPY Cargo.toml Cargo.lock ./

# Create dummy main.rs to build dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy actual source code
COPY . .

# Build release version
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install only runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/bin

# Copy only the built binary and config
COPY --from=builder /usr/src/app/target/release/resume-parser .
COPY --from=builder /usr/src/app/config ./config

CMD ["resume-parser"]