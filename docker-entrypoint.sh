#!/bin/sh
set -e

# The persistent volume mounted at DATA_DIR (e.g. Dokploy) is often root-owned,
# which the non-root "node" user can't write — SQLite then fails to open the DB.
# Fix ownership here (running as root), then drop privileges to run the app.
DATA_DIR="${DATA_DIR:-/app/data}"
mkdir -p "$DATA_DIR/uploads"
chown -R node:node "$DATA_DIR"

exec su-exec node "$@"
