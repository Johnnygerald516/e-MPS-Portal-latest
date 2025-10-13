# Docker Deployment Guide for eMPS Portal

This guide provides instructions for deploying the eMPS Portal application using Docker and Kubernetes.

## Prerequisites

- Docker Desktop installed and running
- kubectl installed and configured (for Kubernetes deployment)
- Access to the registry server (10.6.0.157:30000)

## Docker Image Details

- **Image Name**: migrant-fe-portal
- **Image Tag**: v0.0.5
- **Full Image**: 10.6.0.157:30000/migrant-fe-portal:v0.0.5
- **Container Port**: 3100
- **API Endpoint**: 10.6.0.168:30033

## Deployment Steps

### 1. Configure Docker for Insecure Registry

The registry server (10.6.0.157:30000) is not using HTTPS, so you need to configure Docker to use it as an insecure registry:

```powershell
.\configure-docker-registry.ps1
```

After running this script, restart Docker for the changes to take effect.

### 2. Build and Push Docker Image

Build and push the Docker image to the registry:

```powershell
.\docker-build-push-simple.ps1
```

This script will:
- Build the Docker image with the Next.js application
- Tag it as 41.59.104.107:30000/migrant-fe-portal:v0.0.1
- Push it to the registry

### 3. Deploy to Kubernetes

Deploy the application to Kubernetes:

```powershell
.\deploy-to-kubernetes.ps1
```

This script will:
- Apply the Kubernetes deployment configuration
- Check the status of the deployment, pods, services, and ingress

## Manual Deployment Steps

If you prefer to run the commands manually:

### 1. Configure Docker for Insecure Registry

Add the registry to the insecure registries list in Docker:

1. Edit or create the daemon.json file:
   - Windows: `%ProgramData%\docker\config\daemon.json`
   - Linux: `/etc/docker/daemon.json`

2. Add the following content:
   ```json
   {
     "insecure-registries": ["10.6.0.157:30000"]
   }
   ```

3. Restart Docker

### 2. Build and Push Docker Image

```bash
# Build the Docker image
docker build --build-arg NEXT_PUBLIC_API_URL=http://10.6.0.168:30033 -t 10.6.0.157:30000/migrant-fe-portal:v0.0.5 .

# Push the Docker image to the registry
docker push 10.6.0.157:30000/migrant-fe-portal:v0.0.5
```

### 3. Deploy to Kubernetes

```bash
# Apply the Kubernetes deployment
kubectl apply -f k8s-deployment.yaml

# Check the status of the deployment
kubectl get deployments -l app=migrant-fe-portal
kubectl get pods -l app=migrant-fe-portal
kubectl get services migrant-fe-portal-service
kubectl get ingress migrant-fe-portal-ingress
```

## Troubleshooting

### Docker Push Fails

If you get an error like "http: server gave HTTP response to HTTPS client" when pushing the image:

1. Make sure you've configured Docker to use the insecure registry
2. Restart Docker after making the configuration change
3. Try pushing again

### Kubernetes Deployment Fails

If the Kubernetes deployment fails:

1. Check the pod status: `kubectl get pods -l app=migrant-fe-portal`
2. Check the pod logs: `kubectl logs <pod-name>`
3. Describe the pod for more details: `kubectl describe pod <pod-name>`

### Application Not Accessible

If the application is not accessible after deployment:

1. Check the service status: `kubectl get services migrant-fe-portal-service`
2. Check the ingress status: `kubectl get ingress migrant-fe-portal-ingress`
3. Make sure the API endpoint is correctly configured in the deployment

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
