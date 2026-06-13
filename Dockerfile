# =====================================================
# جنون جنوبي — static site served by nginx
# Single-stage: no build step, just copy + serve.
# =====================================================
FROM nginx:1.27-alpine

# Replace the default server block with our tuned config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the site (Dockerfile, configs, dotfiles excluded via .dockerignore)
COPY . /usr/share/nginx/html

# Lightweight healthcheck so Dokploy/Docker can see the container is live
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
