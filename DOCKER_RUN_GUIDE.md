# Docker Run Guide

## Fixed: Blank Page Issue

The Dockerfile has been updated to include:
- ✅ `server.js` - Custom Next.js server
- ✅ `next.config.js` - Next.js configuration
- ✅ Changed CMD to use `node server.js` directly

## Build the Fixed Image

```bash
./docker-build-push.sh
```

## Run the Container Locally

### Basic Run
```bash
docker run -d \
  -p 5002:5002 \
  --name migrant-portal \
  migrant-fe-portal:1.0.0
```

### Run with Custom API URL
```bash
docker run -d \
  -p 5002:5002 \
  -e NEXT_PUBLIC_API_URL=http://10.252.0.4:3300 \
  -e NEXT_PUBLIC_APP_VERSION=1.0.0 \
  --name migrant-portal \
  migrant-fe-portal:1.0.0
```

### Run from Registry
```bash
docker run -d \
  -p 5002:5002 \
  -e NEXT_PUBLIC_API_URL=http://10.252.0.4:3300 \
  --name migrant-portal \
  10.254.0.3:30000/migrant-fe-portal:1.0.0
```

## Access the Application

Open browser: `http://localhost:5002`

## Check Container Logs

```bash
# View logs
docker logs migrant-portal

# Follow logs in real-time
docker logs -f migrant-portal
```

## Troubleshooting

### Blank Page
**Cause:** Missing server.js or environment variables not set during build
**Fix:** Rebuild with updated Dockerfile (already fixed)

### Container Exits Immediately
```bash
# Check what happened
docker logs migrant-portal

# Check if port is already in use
lsof -i :5002
```

### Can't Connect to API
**Cause:** API URL not accessible from container
**Fix:** Use host network or correct API URL
```bash
# Use host network (Mac/Linux)
docker run -d \
  --network host \
  -e NEXT_PUBLIC_API_URL=http://10.252.0.4:3300 \
  migrant-fe-portal:1.0.0
```

### Environment Variables Not Working
**Remember:** `NEXT_PUBLIC_*` variables must be set at BUILD time, not runtime
```bash
# Build with custom API URL
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://your-api:3300 \
  -t migrant-fe-portal:1.0.0 .
```

## Container Management

```bash
# Stop container
docker stop migrant-portal

# Start container
docker start migrant-portal

# Restart container
docker restart migrant-portal

# Remove container
docker rm -f migrant-portal

# View running containers
docker ps

# View all containers
docker ps -a
```

## Health Check

```bash
# Check if app is responding
curl http://localhost:5002

# Check container stats
docker stats migrant-portal
```

## Production Deployment

### Using Docker Compose (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  migrant-portal:
    image: 10.254.0.3:30000/migrant-fe-portal:1.0.0
    ports:
      - "5002:5002"
    environment:
      - NEXT_PUBLIC_API_URL=http://10.252.0.4:3300
      - NEXT_PUBLIC_APP_VERSION=1.0.0
      - NODE_ENV=production
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Run:
```bash
docker-compose up -d
```

## Registry Push Issues

If push times out or fails:

1. **Check registry connectivity:**
```bash
curl http://10.254.0.3:30000/v2/_catalog
```

2. **Verify insecure registry is configured** in Docker Desktop settings

3. **Try manual push with timeout:**
```bash
docker push 10.254.0.3:30000/migrant-fe-portal:1.0.0
```

4. **If network is slow, save and load image:**
```bash
# On build machine
docker save migrant-fe-portal:1.0.0 | gzip > migrant-portal.tar.gz

# Transfer file to server, then:
docker load < migrant-portal.tar.gz
docker tag migrant-fe-portal:1.0.0 10.254.0.3:30000/migrant-fe-portal:1.0.0
docker push 10.254.0.3:30000/migrant-fe-portal:1.0.0
```
