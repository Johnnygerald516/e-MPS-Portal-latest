# Docker Instructions for Migrant-FE-Portal

## Prerequisites
- Docker installed on your machine
- Your project code with the Dockerfile and .dockerignore files

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

### Using a .env file:

```bash
docker run -p 3100:3100 --env-file .env migrant-fe-portal:v0.0.1
```

### Passing environment variables directly:

```bash
docker run -p 3100:3100 -e API_ENDPOINT=http://10.6.0.0.164:30033 migrant-fe-portal:v0.0.1
```

Replace `your_db_url`, `your_api_key`, etc. with your actual environment variable values.

## Accessing the Application

Once the container is running, you can access your application at:

```
http://localhost:3100
```

## Pushing to Private Registry

To upload your image to the specified private registry:

1. Tag your image with the registry address:
   ```bash
   docker tag migrant-fe-portal:v0.0.1 10.6.0.157:30000/migrant-fe-portal:v0.0.1
   ```

2. Push the image to the registry:
   ```bash
   docker push 10.6.0.157:30000/migrant-fe-portal:v0.0.1
   ```

3. If the registry requires authentication, log in first:
   ```bash
   docker login 10.6.0.157:30000 -u username -p password
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
