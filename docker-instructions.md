# Docker Instructions for Migrant-FE-Portal

## Deployment Configuration
- Image Name: `migrant-fe-portal`
- Image Registry Path: `41.59.104.107:30000/migrant-fe-portal:v0.0.1`
- Container Port: `3100`
- Host IP: `0.0.0.0` (to bind to all network interfaces)
- API Endpoint: `41.59.104.109:30033`

## Prerequisites
- Docker installed on your machine
- Your project code with the Dockerfile and .dockerignore files
- Access to the private registry at `41.59.104.107:30000`

## Environment Variables
Since the `.env` file is gitignored (for security reasons), you'll need to handle environment variables when running the Docker container. There are two approaches:

### Option 1: Create a .env file for Docker
1. Create a `.env` file with all required environment variables for production
2. Use the `--env-file` flag when running the container

### Option 2: Pass environment variables directly
Pass environment variables directly using the `-e` flag when running the container

## Building the Docker Image

Navigate to your project directory and run:

```bash
docker build -t migrant-fe-portal:v0.0.1 .
```

This will build your Docker image with the tag `migrant-fe-portal:v0.0.1`.

## Running the Docker Container

### Using Docker Run Command:

```bash
docker run -d --name migrant-fe-portal -p 3100:3100 \
  -e NODE_ENV=production \
  -e PORT=3100 \
  -e HOST=0.0.0.0 \
  -e NEXT_PUBLIC_API_URL=http://41.59.104.109:30033 \
  41.59.104.107:30000/migrant-fe-portal:v0.0.1
```

### Using Docker Compose:

```bash
docker-compose up -d
```

This will use the configuration in the `docker-compose.yml` file to start the container.

## Accessing the Application

Once the container is running, you can access your application at:

```
http://localhost:3100
```

## Pushing to Private Registry

To upload your image to the specified private registry at 41.59.104.107:30000:

1. Tag your image with the registry address:
   ```bash
   docker tag migrant-fe-portal:v0.0.1 41.59.104.107:30000/migrant-fe-portal:v0.0.1
   ```

2. Push the image to the registry:
   ```bash
   docker push 41.59.104.107:30000/migrant-fe-portal:v0.0.1
   ```

3. If the registry requires authentication, log in first:
   ```bash
   docker login 41.59.104.107:30000 -u username -p password
   ```

## Kubernetes Deployment

We've created Kubernetes configuration files in the `kubernetes/` directory to deploy your application to a Kubernetes cluster.

### Deploying to Kubernetes

1. Apply the deployment configuration:
   ```bash
   kubectl apply -f kubernetes/deployment.yaml
   ```

2. Apply the service configuration to expose your application:
   ```bash
   kubectl apply -f kubernetes/service.yaml
   ```

3. Check the status of your deployment:
   ```bash
   kubectl get deployments
   kubectl get pods
   kubectl get services
   ```

4. Access your application using the LoadBalancer IP (41.59.104.107) or NodePort (30000):
   ```
   http://41.59.104.107:3100
   ```
   or
   ```
   http://<node-ip>:30000
   ```

## Additional Docker Commands

- View running containers:
  ```bash
  docker ps
  ```

- Stop a container:
  ```bash
  docker stop container_id
  ```

- Remove a container:
  ```bash
  docker rm container_id
  ```

- View Docker images:
  ```bash
  docker images
  ```

- Remove a Docker image:
  ```bash
  docker rmi image_id
  ```
