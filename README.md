This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
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

## Deploy with Docker

This application can be deployed using Docker. The project includes a Dockerfile and docker-compose.yml for easy containerization.

### Docker Image Information

- Image name: migrant-fe-portal
- Image tag: v0.0.2
- Registry: 10.6.0.157:30000
- Container port: 3100
- API Endpoint: 10.6.0.168:30033

### Building and Running with Docker

```bash
# Build the Docker image
docker build -t 10.6.0.157:30000/migrant-fe-portal:v0.0.2 .

# Run the container
docker run -p 3100:3100 10.6.0.157:30000/migrant-fe-portal:v0.0.2
```

### Using Docker Compose

```bash
# Start the application using docker-compose
docker-compose up -d

# Stop the application
docker-compose down
```

### Pushing to Registry

```bash
# Push the image to the registry
docker push 10.6.0.157:30000/migrant-fe-portal:v0.0.2
```
