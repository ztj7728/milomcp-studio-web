# 🐳 Docker Deployment Guide

This guide shows how to deploy MiloMCP Studio using Docker with elegant environment variable management.

## Quick Start

### 1. Environment Setup

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Required Settings
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-jwt-secret-key-here
NEXT_PUBLIC_API_URL=http://your-backend:3030
```

### 2. Build and Run with Docker Compose

```bash
# Start the application
npm run docker:up

# View logs
npm run docker:logs

# Stop the application
npm run docker:down

# Rebuild and restart
npm run docker:rebuild
```

### 3. Or Build Manually

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run
```

## Environment Variables

The application uses the following environment variables:

### Required
- `NEXTAUTH_URL` - Your domain URL (e.g., https://yourdomain.com)
- `NEXTAUTH_SECRET` - Secret key for JWT tokens
- `NEXT_PUBLIC_API_URL` - Your MiloMCP backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL for real-time connections
- `NEXT_PUBLIC_API_URL_DISPLAY` - Public display URL for the API (can be different from actual API URL)

### Optional
- `NODE_ENV` - Environment (production/development)
- `PORT` - Port to run on (default: 3000)

## Deployment Options

### Option 1: Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  milomcp-studio:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

### Option 2: Docker with External Orchestration

```bash
# Build
docker build -t milomcp-studio .

# Run with environment file
docker run -d \
  --name milomcp-studio \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  milomcp-studio
```

### Option 3: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: milomcp-studio
spec:
  replicas: 2
  selector:
    matchLabels:
      app: milomcp-studio
  template:
    metadata:
      labels:
        app: milomcp-studio
    spec:
      containers:
      - name: milomcp-studio
        image: milomcp-studio:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: milomcp-studio-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: milomcp-studio-service
spec:
  selector:
    app: milomcp-studio
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Reverse Proxy Setup

### Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddy (Recommended)

```
yourdomain.com {
    reverse_proxy localhost:3000
    
    # Optional: Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
    }
}
```

### Traefik

```yaml
version: '3.8'
services:
  milomcp-studio:
    build: .
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.milomcp.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.milomcp.tls.certresolver=letsencrypt"
      - "traefik.http.services.milomcp.loadbalancer.server.port=3000"
    env_file:
      - .env
```

## Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Configure proper `NEXTAUTH_URL` with your domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL/TLS with reverse proxy
- [ ] Set up monitoring and logging
- [ ] Configure health checks
- [ ] Set up backup strategy for user data
- [ ] Configure rate limiting at reverse proxy level

## Monitoring

The Docker container includes a health check endpoint:

```bash
# Check application health
curl -f http://localhost:3000/api/health

# View container health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Monitor logs
docker-compose logs -f milomcp-studio
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Change port in .env file
   PORT=3001
   ```

2. **Environment variables not loading**
   ```bash
   # Verify .env file exists and has correct format
   cat .env
   
   # Rebuild container
   npm run docker:rebuild
   ```

3. **Can't connect to backend API**
   ```bash
   # Check NEXT_PUBLIC_API_URL in .env
   # Ensure backend is accessible from container
   ```

### Logs

```bash
# Application logs
npm run docker:logs

# Container inspection
docker inspect milomcp-studio

# Container shell access
docker exec -it milomcp-studio sh
```

## Security Notes

- Never commit `.env` files to version control
- Use secrets management in production (Docker secrets, Kubernetes secrets)
- Enable HTTPS in production
- Keep Docker images updated
- Use non-root user in containers (already configured)
- Implement proper firewall rules

## Performance Optimization

- Use multi-stage builds (already implemented)
- Configure proper resource limits
- Enable container health checks
- Use image caching strategies
- Consider using alpine-based images for smaller size