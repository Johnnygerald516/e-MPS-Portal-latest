#!/bin/bash

# Docker Build and Push Script for Local Registry
# ================================================

# Configuration
IMAGE_NAME="migrant-fe-portal"
IMAGE_VERSION="0.0.3"
LOCAL_REGISTRY="10.248.0.7:30000"
CONTAINER_PORT="5002"

# Load NEXT_PUBLIC_API_URL from .env file so the image bakes in the latest value.
# Shell env var overrides .env if set.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
if [ -z "${NEXT_PUBLIC_API_URL}" ] && [ -f "${ENV_FILE}" ]; then
  # Extract NEXT_PUBLIC_API_URL from .env (ignore comments, strip quotes)
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

# Build arguments (can be overridden via shell env)
API_URL="${NEXT_PUBLIC_API_URL}"

if [ -z "${API_URL}" ]; then
  echo -e "\033[0;31mError: NEXT_PUBLIC_API_URL is not set (not in shell env and not found in ${ENV_FILE}).\033[0m"
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Docker Build and Push Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "  Image Name: ${IMAGE_NAME}"
echo "  Version: ${IMAGE_VERSION}"
echo "  Local Registry: ${LOCAL_REGISTRY}"
echo "  Container Port: ${CONTAINER_PORT}"
echo "  API URL: ${API_URL}"
echo ""

# Step 0: Setup buildx builder for multi-platform
echo -e "${BLUE}Step 0: Setting up Docker buildx for multi-platform...${NC}"
if ! docker buildx inspect multiplatform-builder > /dev/null 2>&1; then
  docker buildx create --name multiplatform-builder --use
else
  docker buildx use multiplatform-builder
fi

echo -e "${GREEN}✓ Buildx ready${NC}"
echo ""

# Step 1: Build multi-platform image and load to local Docker
echo -e "${BLUE}Step 1: Building multi-platform Docker image (amd64 + arm64)...${NC}"
echo -e "${BLUE}Note: Building for amd64 first (for registry push)...${NC}"
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL="${API_URL}" \
  -t ${IMAGE_NAME}:${IMAGE_VERSION} \
  -t ${IMAGE_NAME}:latest \
  --load \
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

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Docker tag failed${NC}"
  exit 1
fi

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
echo "To run the container:"
echo "  docker run -d -p ${CONTAINER_PORT}:${CONTAINER_PORT} ${LOCAL_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}"
echo ""
echo "To pull from another machine:"
echo "  docker pull ${LOCAL_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}"
echo ""
