#!/bin/bash

echo "🧹 Cleaning up node_modules and lock files..."

# Remove all node_modules directories
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Remove all package-lock.json files
find . -name 'package-lock.json' -type f -delete

# Remove dist directories
find . -name 'dist' -type d -prune -exec rm -rf '{}' +

echo "🧹 Cleaning up Rust build artifacts..."
if [ -d "packages/resume-parser" ]; then
    cd packages/resume-parser
    cargo clean
    cd ../..
fi

echo "✨ Cleanup complete!" 