FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=http://10.6.0.168:30033
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV HOST=0.0.0.0
ENV PORT=3100

# Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json ./
# Configure npm to use a more reliable registry and add retry logic
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps || \
    (npm cache clean --force && npm install --legacy-peer-deps --no-package-lock)

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3100
ENV HOST=0.0.0.0
ARG NEXT_PUBLIC_API_URL=http://10.6.0.168:30033
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3100

# Set container label for the image name
LABEL org.opencontainers.image.name="migrant-fe-portal"
LABEL org.opencontainers.image.version="v0.0.1"

# Start the application in production mode
CMD ["npm", "run", "start", "--", "-p", "3100", "-H", "0.0.0.0"]
