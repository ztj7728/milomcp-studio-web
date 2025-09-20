# Docker Environment Variables Guide

This guide explains how to configure environment variables dynamically with the Docker image **after** it's built.

## 🎯 Dynamic Environment Variable Support

Yes! The Docker image supports reading `.env` files and environment variables dynamically at container startup, **without** rebuilding the image.

## 📋 Methods to Configure Environment Variables

### Method 1: Using docker-compose with .env file (Recommended)

1. **Create or modify `.env` file** in your project directory:
```env
# .env
NEXT_PUBLIC_API_URL=https://your-api-server.com
NEXT_PUBLIC_WS_URL=wss://your-api-server.com/ws
NEXT_PUBLIC_API_URL_DISPLAY=https://your-api-server.com
PORT=3000
```

2. **Run with docker-compose**:
```bash
docker-compose up -d
```

The `docker-compose.yml` automatically reads the `.env` file via:
```yaml
env_file:
  - .env
```

### Method 2: Direct Environment Variables

**Pass variables directly to docker run**:
```bash
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api-server.com \
  -e NEXT_PUBLIC_WS_URL=wss://your-api-server.com/ws \
  -e NEXT_PUBLIC_API_URL_DISPLAY=https://your-api-server.com \
  zhoutijie/milomcp-studio-web:0.0.1
```

### Method 3: Mount .env file into container

**Mount your local .env file**:
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/.env:/app/.env:ro \
  zhoutijie/milomcp-studio-web:0.0.1
```

### Method 4: Using separate env file

**Create a production.env file**:
```env
# production.env
NEXT_PUBLIC_API_URL=https://prod-api.example.com
NEXT_PUBLIC_WS_URL=wss://prod-api.example.com/ws
NEXT_PUBLIC_API_URL_DISPLAY=https://prod-api.example.com
```

**Use with docker-compose**:
```yaml
services:
  milomcp-studio:
    image: zhoutijie/milomcp-studio-web:0.0.1
    ports:
      - "3000:3000"
    env_file:
      - production.env  # Use different env file
```

## 🔧 How It Works

1. **Build Time**: The image is built with placeholder values
2. **Runtime**: The `inject-env.sh` script runs when the container starts:
   - Reads environment variables from the container environment
   - Loads `.env` file if mounted
   - Injects actual values into the Next.js application files
   - Starts the application with real configuration

## 🚀 Example: Switching Environments

**Development**:
```bash
# .env.dev
NEXT_PUBLIC_API_URL=http://localhost:3030
NEXT_PUBLIC_API_URL_DISPLAY=http://localhost:3030

docker run -v $(pwd)/.env.dev:/app/.env:ro -p 3000:3000 milomcp-studio-web
```

**Production**:
```bash
# .env.prod  
NEXT_PUBLIC_API_URL=https://api.production.com
NEXT_PUBLIC_API_URL_DISPLAY=https://api.production.com

docker run -v $(pwd)/.env.prod:/app/.env:ro -p 3000:3000 milomcp-studio-web
```

**Same image, different configuration!** 🎉

## 📝 Available Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3030` | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:3030/ws` | Yes |
| `NEXT_PUBLIC_API_URL_DISPLAY` | Display URL in UI | Same as API_URL | No |
| `PORT` | Container port | `3000` | No |
| `NEXTAUTH_URL` | NextAuth URL | Required for auth | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret | Required for auth | Yes |

## 🔍 Debugging

**Check what environment variables are loaded**:
```bash
docker logs <container-name>
```

Look for output like:
```
🔧 Injecting runtime environment variables...
📄 Found .env file, loading variables...
✅ Loaded variables from .env file
🌍 Environment variables:
  NEXT_PUBLIC_API_URL=https://your-api-server.com
  NEXT_PUBLIC_WS_URL=wss://your-api-server.com/ws
  NEXT_PUBLIC_API_URL_DISPLAY=https://your-api-server.com
✅ Environment variables injected successfully!
```

## 💡 Best Practices

1. **Use `.env` files** for easier management
2. **Keep secrets secure** - don't put sensitive data in `NEXT_PUBLIC_` variables
3. **Test different environments** with the same image
4. **Version your .env files** for different deployments
5. **Use docker-compose** for complex setups

## 🎁 Benefits

- ✅ **One image, multiple environments**
- ✅ **No rebuild required for config changes**
- ✅ **Easy deployment pipeline**
- ✅ **Configuration as code**
- ✅ **Secrets management compatible**