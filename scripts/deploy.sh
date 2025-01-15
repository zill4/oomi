#!/bin/bash

# Ensure script stops on first error
set -e

# Build the production images
docker-compose -f docker-compose.prod.yml build

# Log in to DO Container Registry
./../../doctl.exe registry login

# Tag and push each service
docker tag oomi-frontend:latest registry.digitalocean.com/oomi/frontend:latest
docker tag oomi-backend:latest registry.digitalocean.com/oomi/backend:latest
docker tag oomi-resume-parser:latest registry.digitalocean.com/oomi/resume-parser:latest

docker push registry.digitalocean.com/oomi/frontend:latest
docker push registry.digitalocean.com/oomi/backend:latest
docker push registry.digitalocean.com/oomi/resume-parser:latest

# SSH into droplet and pull/restart services
# ssh root@your-droplet-ip '
#   cd /root/app && \
#   docker-compose -f docker-compose.prod.yml pull && \
#   docker-compose -f docker-compose.prod.yml up -d
# ' 