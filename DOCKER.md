# Docker Deployment Guide

This document provides instructions for building and deploying the migrant-fe-portal application using Docker.

## Docker Image Details

- **Image Name**: migrant-fe-portal
- **Registry**: 41.59.104.107:30000
- **Version**: v0.0.6
- **Container Port**: 3100
- **API Endpoint**: https://41.59.104.109:30033

## Building and Pushing the Docker Image

### Using the Provided Scripts

#### For Windows:
```bash
.\build-and-push.bat
```

#### For Linux/Mac:
```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

### Manual Build and Push

```bash
# Build the Docker image
docker build -t 41.59.104.107:30000/migrant-fe-portal:v0.0.6 .

# Push the Docker image to the registry
docker push 41.59.104.107:30000/migrant-fe-portal:v0.0.6
```

## Deploying to Kubernetes

Apply the Kubernetes deployment configuration:

```bash
kubectl apply -f k8s-deployment.yaml
```

## Environment Variables

The following environment variables are configured:

- `NODE_ENV`: production
- `PORT`: 3100
- `HOST`: 0.0.0.0
- `NEXT_PUBLIC_API_URL`: https://41.59.104.109:30033
- `NEXT_PUBLIC_API_URL_FALLBACK`: https://41.59.104.109:30033

## Local Testing

To test the Docker image locally:

```bash
docker run -p 3100:3100 41.59.104.107:30000/migrant-fe-portal:v0.0.6
```

Then access the application at http://localhost:3100

## Troubleshooting

If you encounter issues with the Docker image:

1. Check Docker logs: `docker logs <container-id>`
2. Verify API connectivity: `curl https://41.59.104.109:30033/health`
3. Check if the port is exposed correctly: `docker ps`
