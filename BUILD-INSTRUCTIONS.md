# eMPS Portal Build and Deployment Instructions

## Building and Pushing the Docker Image

### Using the build-and-push.bat Script

1. Open a Command Prompt or PowerShell window
2. Navigate to the project directory
3. Run the build-and-push.bat script:
   ```
   .\build-and-push.bat
   ```

The script will:
- Build the Docker image with tag `41.59.104.107:30000/migrant-fe-portal:v0.0.7`
- Configure the application to use API at `http://10.6.0.168:30033`
- Push the image to the registry at `41.59.104.107:30000`

### Manual Build and Push

If you prefer to build and push manually:

```bash
# Build the image
docker build --build-arg NEXT_PUBLIC_API_URL=http://10.6.0.168:30033 -t 41.59.104.107:30000/migrant-fe-portal:v0.0.7 .

# Push the image
docker push 41.59.104.107:30000/migrant-fe-portal:v0.0.7
```

## Deploying to Kubernetes

The repository includes a Kubernetes deployment file (`k8s-deployment.yaml`) that's configured to:
- Use the image `41.59.104.107:30000/migrant-fe-portal:v0.0.7`
- Expose port 3100
- Connect to the API at `http://10.6.0.168:30033`

To deploy to Kubernetes:

```bash
kubectl apply -f k8s-deployment.yaml
```

## Running Locally

To run the container locally:

```bash
docker run -p 3100:3100 41.59.104.107:30000/migrant-fe-portal:v0.0.7
```

Then access the application at http://localhost:3100

## Configuration Details

- **Image name**: migrant-fe-portal
- **Full image path**: 41.59.104.107:30000/migrant-fe-portal:v0.0.7
- **Container port**: 3100
- **API endpoint**: 10.6.0.168:30033
