# Docker Local Registry Setup Guide

## Issue
Error: `http: server gave HTTP response to HTTPS client`

This happens because Docker tries to use HTTPS by default, but your local registry `10.254.0.3:30000` uses HTTP.

## Solution: Configure Docker for Insecure Registry

### For Docker Desktop (Mac/Windows)

1. **Open Docker Desktop**
2. **Go to Settings** (gear icon)
3. **Navigate to Docker Engine**
4. **Add the insecure registry** to the JSON configuration:

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "insecure-registries": [
    "10.254.0.3:30000"
  ]
}
```

5. **Click "Apply & Restart"**

### For Docker on Linux

Edit `/etc/docker/daemon.json`:

```bash
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "insecure-registries": ["10.254.0.3:30000"]
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

## Verify Configuration

After restarting Docker, test the connection:

```bash
# Test registry access
curl http://10.254.0.3:30000/v2/_catalog

# Push the image
docker push 10.254.0.3:30000/migrant-fe-portal:1.0.0
```

## Alternative: Use HTTPS (Recommended for Production)

If you control the registry server, configure it with SSL/TLS certificates instead of using insecure mode.

## After Configuration

Run the build and push script again:
```bash
./docker-build-push.sh
```

The push should now succeed!
