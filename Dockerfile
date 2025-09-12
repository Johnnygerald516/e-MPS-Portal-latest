FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables for development mode
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_ENDPOINT=http://10.6.0.0.164:30033
ENV PORT=3100

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 3100

# Start the application in development mode
CMD ["npm", "run", "dev", "--", "-p", "3100"]
