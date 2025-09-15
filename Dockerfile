# Dockerfile

# ==============================================================================
# 阶段 1: 依赖安装 (deps)
# ==============================================================================
# 使用一个明确的 Node.js 版本作为基础镜像
FROM node:22-alpine AS deps
# Alpine Linux 的一个最佳实践是更新 ca-certificates
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 仅复制 package.json 和 lock 文件
COPY package.json package-lock.json ./
# 使用 npm ci 而不是 install，它可以提供更快、更可靠的构建
RUN npm ci

# ==============================================================================
# 阶段 2: 代码构建 (builder)
# ==============================================================================
FROM node:22-alpine AS builder
WORKDIR /app

# 从 'deps' 阶段复制 node_modules，而不是重新安装
COPY --from=deps /app/node_modules ./node_modules
# 复制所有项目文件
COPY . .

# 执行构建。注意：此时我们不需要真实的 .env 文件
# Next.js 会在没有环境变量的情况下构建，我们稍后在容器启动时注入它们
RUN npm run build

# ==============================================================================
# 阶段 3: 生产镜像 (runner)
# ==============================================================================
FROM node:22-alpine AS runner
WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production
# 关闭 Next.js 的遥测
ENV NEXT_TELEMETRY_DISABLED 1

# 创建一个非 root 用户来运行应用，增强安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 从 'builder' 阶段复制构建产物
COPY --from=builder /app/package.json ./package.json

# 调整 .next 目录的所有权为新创建的用户
# standalone 输出模式会把所有依赖打包，更适合容器化
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制并设置入口脚本的权限
COPY --chown=nextjs:nodejs scripts/inject-env.sh ./scripts/inject-env.sh
RUN chmod +x ./scripts/inject-env.sh

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置容器的入口点为我们的注入脚本
# 这个脚本会在容器启动时运行
ENTRYPOINT ["/app/scripts/inject-env.sh"]

# 容器的默认命令，它会被传递给入口脚本执行
# 注意：这里使用的是 standalone 模式的启动方式
CMD ["node", "server.js"]
