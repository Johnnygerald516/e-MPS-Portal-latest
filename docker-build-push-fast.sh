#!/bin/bash

# Docker Build and Push Script - FAST VERSION
# ===========================================

# Configuration
IMAGE_NAME="migrant-fe-portal"
IMAGE_VERSION="0.0.3"
LOCAL_REGISTRY="10.248.0.7:30000"
CONTAINER_PORT="5002"

# Load NEXT_PUBLIC_API_URL from .env so the image bakes in the latest value.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
if [ -z "${NEXT_PUBLIC_API_URL}" ] && [ -f "${ENV_FILE}" ]; then
  ENV_API_URL=$(grep -E '^[[:space:]]*NEXT_PUBLIC_API_URL[[:space:]]*=' "${ENV_FILE}" \
    | tail -n1 \
    | sed -E 's/^[[:space:]]*NEXT_PUBLIC_API_URL[[:space:]]*=[[:space:]]*//' \
    | sed -E 's/^"(.*)"$/\1/' \
    | sed -E "s/^'(.*)'\$/\\1/" \
    | tr -d '\r')
  if [ -n "${ENV_API_URL}" ]; then
    export NEXT_PUBLIC_API_URL="${ENV_API_URL}"
  fi
fi

API_URL="${NEXT_PUBLIC_API_URL}"

if [ -z "${API_URL}" ]; then
  echo "Error: NEXT_PUBLIC_API_URL is not set (not in shell env and not found in ${ENV_FILE})."
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Docker Build and Push Script (FAST)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "  Image Name: ${IMAGE_NAME}"
echo "  Version: ${IMAGE_VERSION}"
echo "  Local Registry: ${LOCAL_REGISTRY}"
echo "  Container Port: ${CONTAINER_PORT}"
echo "  API URL: ${API_URL}"
echo ""

# Step 1: Build using native Docker with BuildKit (faster than buildx)
echo -e "${BLUE}Step 1: Building Docker image with native BuildKit...${NC}"
echo -e "${YELLOW}Using npm registry: registry.npmjs.org${NC}"

DOCKER_BUILDKIT=1 docker build \
  --build-arg NEXT_PUBLIC_API_URL="${API_URL}" \
  --build-arg NPM_REGISTRY="https://registry.npmjs.org/" \
  -t ${IMAGE_NAME}:${IMAGE_VERSION} \
  -t ${IMAGE_NAME}:latest \
  -f Dockerfile.fast \
  .

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Docker build failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Step 2: Tag for local registry
echo -e "${BLUE}Step 2: Tagging image for local registry...${NC}"
docker tag ${IMAGE_NAME}:${IMAGE_VERSION} ${LOCAL_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}
docker tag ${IMAGE_NAME}:latest ${LOCAL_REGISTRY}/${IMAGE_NAME}:latest

echo -e "${GREEN}✓ Tagging successful${NC}"
echo ""

# Step 3: Push to local registry
echo -e "${BLUE}Step 3: Pushing to local registry...${NC}"
docker push ${LOCAL_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}
docker push ${LOCAL_REGISTRY}/${IMAGE_NAME}:latest

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Docker push failed${NC}"
  echo -e "${RED}Make sure the local registry is accessible at ${LOCAL_REGISTRY}${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Push successful${NC}"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Build and Push Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Images pushed to registry:"
echo "  ${LOCAL_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}"
echo "  ${LOCAL_REGISTRY}/${IMAGE_NAME}:latest"
echo ""

# Layer size info
echo -e "${BLUE}Image size info:${NC}"
docker images ${IMAGE_NAME}:${IMAGE_VERSION} --format "  Size: {{.Size}}"
echo ""

echo "To run the container:"
echo "  docker run -d -p ${CONTAINER_PORT}:${CONTAINER_PORT} ${LOCAL_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}"
echo ""

# Show compression tip
echo -e "${YELLOW}Tip: If push is still slow, check network to ${LOCAL_REGISTRY}${NC}"

</CodeContent, 
