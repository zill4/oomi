FROM rust:1.75 as builder

WORKDIR /usr/src/app
COPY . .

# Build with release optimizations
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