# =====================================================
# جنون جنوبي — Node + Express + SQLite, serves the public
# storefront, the /admin dashboard, uploads, and the API.
# =====================================================

# ---- Stage 1: install deps (native build tools for better-sqlite3) ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# ---- Stage 2: runtime ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=8123
ENV DATA_DIR=/app/data
WORKDIR /app

# su-exec lets the entrypoint fix volume ownership as root, then drop to "node"
RUN apk add --no-cache su-exec

# App source + production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server ./server
COPY admin ./admin
COPY css ./css
COPY js ./js
COPY assets ./assets
COPY index.html ./index.html
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /app/data/uploads && chown -R node:node /app/data \
  && chmod +x /usr/local/bin/docker-entrypoint.sh

# NOTE: container starts as root so the entrypoint can chown the mounted
# /app/data volume (often root-owned), then runs the app as "node".

EXPOSE 8123

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8123/healthz >/dev/null 2>&1 || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server/index.js"]
