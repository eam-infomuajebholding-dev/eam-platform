#!/usr/bin/env bash
# One-shot EAM deploy on Ubuntu (Oracle Cloud or any VPS).
# Usage: bash deploy-eam.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY="$ROOT/deploy"

cd "$ROOT"

if [[ ! -f app/.env ]]; then
  cp app/.env.example app/.env
  echo "Created app/.env — edit secrets before production traffic."
fi

if [[ ! -f deploy/.env ]]; then
  cp deploy/.env.oracle.example deploy/.env
  POSTGRES_PASSWORD="$(openssl rand -hex 24 2>/dev/null || head -c 32 /dev/urandom | xxd -p)"
  sed -i.bak "s/replace-with-strong-password/${POSTGRES_PASSWORD}/" deploy/.env
  rm -f deploy/.env.bak
  echo "Generated POSTGRES_PASSWORD in deploy/.env"
fi

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER" || true
fi

cd "$DEPLOY"
docker compose --env-file .env up -d --build
docker compose exec -T backend alembic upgrade head

echo ""
echo "Deploy complete."
echo "  Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo SERVER_IP)"
echo "  API config: curl http://127.0.0.1/api/config"
echo "  Logs: docker compose logs -f"
