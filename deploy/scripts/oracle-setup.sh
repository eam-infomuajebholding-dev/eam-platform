#!/usr/bin/env bash
# Bootstrap an Ubuntu 22.04 VM on Oracle Cloud for EAM deploy.
# Run as root or with sudo: bash oracle-setup.sh

set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version >/dev/null 2>&1; then
  apt-get update
  apt-get install -y docker-compose-plugin git ufw
fi

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "Docker: $(docker --version)"
echo "Compose: $(docker compose version)"
echo "Done. Clone the repo, configure app/.env, then: cd deploy && docker compose up -d --build"
