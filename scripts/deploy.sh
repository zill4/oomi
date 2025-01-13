#!/bin/bash

# Build the production images
docker-compose -f docker-compose.prod.yml build

# Push to Digital Ocean Container Registry
doctl registry login
docker tag oomi-app:latest registry.digitalocean.com/your-registry/oomi-app:latest
docker push registry.digitalocean.com/your-registry/oomi-app:latest

# Deploy using doctl
doctl apps create-deployment your-app-id 