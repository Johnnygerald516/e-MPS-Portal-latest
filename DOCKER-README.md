# Docker Deployment Guide for Migrant Portal Frontend

This guide explains how to build, push, and deploy the Migrant Portal Frontend application using Docker.

## Image Details

- **Image Name**: migrant-fe-portal
- **Registry**: 41.59.104.107:30000
- **Tag**: v0.0.2
- **Full Image Path**: 41.59.104.107:30000/migrant-fe-portal:v0.0.2
- **Container Port**: 3100
- **API Endpoint**: 41.59.104.109:30033

## Building and Pushing the Docker Image

### Option 1: Using the Provided Script

1. Run the PowerShell script:
   ```powershell
   .\docker-build-push-v0.0.2.ps1
   ```

   This script will:
   - Build the Docker image with the correct API endpoint
   - Configure Docker to use the insecure registry if needed
   - Push the image to the registry

### Option 2: Manual Commands

If you prefer to run the commands manually:

1. Build the Docker image:
   ```powershell
   docker build --build-arg NEXT_PUBLIC_API_URL=http://41.59.104.109:30033 -t 41.59.104.107:30000/migrant-fe-portal:v0.0.2 .
   ```

2. Push the image to the registry:
   ```powershell
   docker push 41.59.104.107:30000/migrant-fe-portal:v0.0.2
   ```

## Using the Updated Dockerfile

An updated Dockerfile (Dockerfile.v0.0.2) has been provided with the correct API endpoint and version tag. To use it:

1. Replace the existing Dockerfile:
   ```powershell
   copy Dockerfile.v0.0.2 Dockerfile
   ```

2. Then build and push as described above.

## Kubernetes Deployment

Here's an example Kubernetes deployment configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: migrant-fe-portal
spec:
  replicas: 1
  selector:
    matchLabels:
      app: migrant-fe-portal
  template:
    metadata:
      labels:
        app: migrant-fe-portal
    spec:
      containers:
      - name: migrant-fe-portal
        image: 41.59.104.107:30000/migrant-fe-portal:v0.0.2
        ports:
        - containerPort: 3100
        env:
        - name: NEXT_PUBLIC_API_URL
          value: 'http://41.59.104.109:30033'
---
apiVersion: v1
kind: Service
metadata:
  name: migrant-fe-portal
spec:
  selector:
    app: migrant-fe-portal
  ports:
  - port: 80
    targetPort: 3100
  type: ClusterIP
```

## Troubleshooting

### Insecure Registry Issues

If you encounter issues pushing to the registry, you may need to configure Docker to use an insecure registry:

1. Edit or create the Docker daemon configuration file:
   ```
   %ProgramData%\docker\config\daemon.json
   ```

2. Add the following content:
   ```json
   {
     "insecure-registries": ["41.59.104.107:30000"]
   }
   ```

3. Restart Docker Desktop.

### Network Issues

If you encounter network issues when building the image, try using the network fix script:
```powershell
.\docker-build-network-fix.ps1
```
