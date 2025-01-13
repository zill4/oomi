FROM rust:1.83-slim as builder
WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy the entire resume-parser directory
COPY packages/resume-parser .

# Build the release version
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && \
    apt-get install -y libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/resume-parser /app/resume-parser
COPY packages/resume-parser/config /app/config/
RUN chmod -R 755 /app/config/

CMD ["/app/resume-parser"] 