# Local Docker Registry Setup

This document provides instructions for setting up and using a local Docker registry for the eMPS Portal application.

## Setting Up a Local Docker Registry

1. **Start a local Docker registry**:

   ```bash
   docker run -d -p 5000:5000 --restart=always --name registry registry:2
   ```

   This command starts a Docker registry container that listens on port 5000.

2. **Verify the registry is running**:

   ```bash
   docker ps
   ```

   You should see the registry container in the list of running containers.

## Building and Pushing Images to Local Registry

The `build-and-push.bat` script has been updated to use the local registry. It performs the following actions:

1. Builds the Docker image with the API URL set to `http://10.6.0.168:30033`
2. Tags the image with the local registry address (`localhost:5000`)
3. Pushes the image to the local registry

To use the script:

1. Simply run `build-and-push.bat`
2. The script will build and push the image to your local registry
3. If there are any errors, the script will provide helpful messages

## Pulling Images from Local Registry

To pull an image from your local registry:

```bash
docker pull localhost:5000/migrant-fe-portal:v0.0.7
```

## Running the Container

To run the container locally:

```bash
docker run -p 3100:3100 localhost:5000/migrant-fe-portal:v0.0.7
```

This will start the eMPS Portal application and make it available at http://localhost:3100

## Accessing the Application

Once the container is running, you can access the application at:

- **URL**: http://localhost:3100
- **API**: The application will connect to the API at http://10.6.0.168:30033

## Troubleshooting

1. **Registry Connection Issues**:
   - Ensure the registry container is running: `docker ps | grep registry`
   - Check registry logs: `docker logs registry`

2. **Image Push Failures**:
   - Make sure Docker is running and you have permission to push to the registry
   - Try restarting the Docker service

3. **Container Startup Issues**:
   - Check container logs: `docker logs <container_id>`
   - Verify the API at http://10.6.0.168:30033 is accessible from your host machine
