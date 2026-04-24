# Docker Image Size Optimization

## Why Is the Image Large?

Your current image is ~320MB because it includes:
- **node_modules (222MB)** - All dependencies (dev + production)
- **.next build (58MB)** - Compiled Next.js application
- **Base Node Alpine (43MB)** - Node.js runtime

## Optimization Applied

### Before (Original)
```dockerfile
# Copies ALL node_modules (dev + production dependencies)
COPY --from=builder /app/node_modules ./node_modules
```
**Result:** ~320MB image with dev dependencies

### After (Optimized)
```dockerfile
# Install production dependencies only
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm install --production --legacy-peer-deps && \
    npm cache clean --force

# Copy ONLY production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
```
**Expected Result:** ~180-220MB image (40-50% smaller)

## Size Breakdown

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| node_modules | 222MB | ~120-140MB | ~80-100MB |
| .next build | 58MB | 58MB | 0MB |
| Base image | 43MB | 43MB | 0MB |
| **Total** | **~320MB** | **~180-220MB** | **~100-140MB** |

## What Was Removed?

Production-only install removes:
- TypeScript compiler
- Testing frameworks (Jest, etc.)
- Build tools (webpack dev dependencies)
- Linters and formatters
- Development-only packages

## Further Optimizations (Optional)

### 1. Use Standalone Output (Smallest - Recommended)
Next.js can create a minimal standalone build:

```dockerfile
# In next.config.js, add:
output: 'standalone'

# Then copy only standalone files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
```
**Expected size:** ~100-150MB

### 2. Remove Unnecessary Files
Add to `.dockerignore`:
```
*.md
*.txt
.git
.github
docs/
tests/
```

### 3. Compress Layers
Use `--squash` flag when building (experimental):
```bash
docker build --squash -t migrant-fe-portal:1.0.0 .
```

## Current Optimization Status

✅ **Applied:** Production-only dependencies
⏳ **Optional:** Standalone output (requires next.config.js change)
⏳ **Optional:** Additional .dockerignore entries

## Rebuild to See Savings

After the current push completes, rebuild to see the size reduction:

```bash
./docker-build-push.sh
```

The new image will be significantly smaller and push faster!

## Network Impact

**First push (current):**
- Size: ~320MB
- Time: 5-15 minutes (depending on network)

**Subsequent pushes (with optimization):**
- Size: ~180-220MB
- Time: 3-8 minutes
- **Only changed layers upload** (usually <50MB)

## Production Benefits

✅ Faster deployments
✅ Less storage on registry
✅ Faster container startup
✅ Lower bandwidth costs
✅ Smaller attack surface (fewer packages)
