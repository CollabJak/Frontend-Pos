# ==========================================
# STAGE 1: Build React Application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy lockfile and package config files first
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm ci

# Copy project source codes
COPY . .

# Build production assets (runs tsc check + vite build)
RUN npm run build

# ==========================================
# STAGE 2: Serve via Nginx
# ==========================================
FROM nginx:alpine AS runner

# Copy custom Nginx configuration file
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy production bundle assets from stage 1 builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
