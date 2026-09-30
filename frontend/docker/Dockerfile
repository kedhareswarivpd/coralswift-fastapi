# ---- Stage 1: build the static Vite bundle ----
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# VITE_API_URL defaults to the relative "/api/v1" (see .env.example), which is
# exactly what the nginx config below proxies to the backend — no build-time
# env var is required for the standard combined deployment.
RUN npm run build

# ---- Stage 2: serve the build with nginx, proxying API calls to the backend ----
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
