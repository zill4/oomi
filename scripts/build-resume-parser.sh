#!/bin/bash

# Ensure we're in the resume parser directory
cd packages/resume-parser

# Build for Linux (assuming you're on a different OS)
cargo build --release --target x86_64-unknown-linux-musl

# Create a deployment directory
mkdir -p ../../deploy/resume-parser
cp target/x86_64-unknown-linux-musl/release/resume-parser ../../deploy/resume-parser/
cp -r config ../../deploy/resume-parser/