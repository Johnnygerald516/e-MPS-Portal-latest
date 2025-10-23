#!/bin/bash

# Exit on error
set -e

echo "Building and pushing Docker image for migrant-fe-portal:v0.0.6"

# Build the Docker image
echo "Building Docker image..."
docker build -t 41.59.104.107:30000/migrant-fe-portal:v0.0.6 .

# Push the Docker image to the registry
echo "Pushing Docker image to registry..."
docker push 41.59.104.107:30000/migrant-fe-portal:v0.0.6

echo "Image successfully built and pushed to 41.59.104.107:30000/migrant-fe-portal:v0.0.6"
