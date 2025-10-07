This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, create a `.env` file in the root directory with your environment variables. You can use the interactive script to create it:

```bash
npm run create-env
```

Or manually create it (see [Environment Variables](#environment-variables) section below).

Then, run the development server:

```bash
# Recommended: Run with environment variables from .env file
npm run dev-env

# Alternative: Standard development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

This application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://your-api-url:port
NEXT_PUBLIC_API_URL_FALLBACK=http://fallback-api-url:port
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_API_KEY_FALLBACK=your-fallback-api-key

# Trusted Hostnames (comma-separated)
NEXT_PUBLIC_TRUSTED_HOSTNAMES=localhost,127.0.0.1,your-hostname

# Image Domains (comma-separated)
NEXT_PUBLIC_IMAGE_DOMAINS=your-api-domain,your-cdn-domain
```

### Environment Variables Description

| Variable | Description | Required | Default |
|----------|-------------|----------|--------|
| `NEXT_PUBLIC_API_URL` | Main API URL | Yes | - |
| `NEXT_PUBLIC_API_URL_FALLBACK` | Fallback API URL if main URL is invalid | No | http://127.0.0.1:8000 |
| `NEXT_PUBLIC_API_KEY` | API key for authentication | No | - |
| `NEXT_PUBLIC_API_KEY_FALLBACK` | Fallback API key | No | - |
| `NEXT_PUBLIC_TRUSTED_HOSTNAMES` | Comma-separated list of trusted hostnames | No | localhost,127.0.0.1 |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | Comma-separated list of domains for Next.js Image component | No | 10.6.0.168 |

### Troubleshooting Environment Variables

If you're having issues with environment variables, you can use these scripts to diagnose problems:

```bash
# Create a new .env file with interactive prompts
npm run create-env

# Check environment variables and API connection
npm run check-env

# Check API connection
npm run check-api
```

## Deploy with Docker

This application can be deployed using Docker. The project includes a Dockerfile and docker-compose.yml for easy containerization.

### Docker Image Information

- Image name: migrant-fe-portal
- Image tag: v0.0.2
- Registry: 10.6.0.157:30000
- Container port: 3100

### Building and Running with Docker

```bash
# Build the Docker image
docker build -t 10.6.0.157:30000/migrant-fe-portal:v0.0.2 .

# Run the container with environment variables
docker run -p 3100:3100 \
  -e NEXT_PUBLIC_API_URL=http://your-api-url:port \
  -e NEXT_PUBLIC_API_KEY=your-api-key \
  -e NEXT_PUBLIC_TRUSTED_HOSTNAMES=localhost,127.0.0.1 \
  -e NEXT_PUBLIC_IMAGE_DOMAINS=your-api-domain \
  10.6.0.157:30000/migrant-fe-portal:v0.0.2
```

### Using Docker Compose

Create a `.env` file in the root directory with your environment variables, then run:

```bash
# Start the application using docker-compose
docker-compose up -d

# Stop the application
docker-compose down
```

Alternatively, you can pass environment variables directly:

```bash
# Start with specific environment variables
NEXT_PUBLIC_API_URL=http://your-api-url:port \
NEXT_PUBLIC_API_KEY=your-api-key \
docker-compose up -d
```

### Pushing to Registry

```bash
# Push the image to the registry
docker push 10.6.0.157:30000/migrant-fe-portal:v0.0.2
```
