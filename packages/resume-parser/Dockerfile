# Build stage
FROM rust:1.77 as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the Cargo files
COPY packages/resume-parser/Cargo.toml ./Cargo.toml

# Create src directory and dummy main.rs for dependency caching
RUN mkdir -p src && \
    echo 'fn main() { println!("Initializing resume-parser..."); }' > src/main.rs

# Build dependencies
RUN cargo build --release

# Remove the dummy source and built files
RUN rm src/main.rs target/release/deps/resume_parser*

# Copy the actual source code
COPY packages/resume-parser/src ./src
COPY packages/resume-parser/config ./config

# Build the application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary from builder
COPY --from=builder /app/target/release/resume-parser /usr/local/bin/
COPY --from=builder /app/config ./config

# Create a non-root user
RUN useradd -m -U -s /bin/false resume-parser

# Set ownership
RUN chown -R resume-parser:resume-parser /app

# Switch to non-root user
USER resume-parser

# Expose the port
EXPOSE 3001

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/resume-parser"] 