FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=http://10.232.0.12:3300
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV HOST=0.0.0.0
ENV PORT=5002

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

# Install production dependencies only
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install --production --legacy-peer-deps && \
    npm cache clean --force

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
# Standalone server uses PORT and HOSTNAME env vars
ENV PORT=5002
ENV HOSTNAME=0.0.0.0
ARG NEXT_PUBLIC_API_URL=http://10.232.0.12:3300
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy standalone output (includes minimal node_modules and built-in server)
COPY --from=builder /app/.next/standalone ./
# Copy static files
COPY --from=builder /app/.next/static ./.next/static
# Copy public files
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 5002

# Set container label for the image name
LABEL org.opencontainers.image.name="migrant-fe-portal"
LABEL org.opencontainers.image.version="0.0.4"
LABEL org.opencontainers.image.description="Migrant Portal Frontend"

# Start the application using Next.js standalone server
CMD ["node", "server.js"]
