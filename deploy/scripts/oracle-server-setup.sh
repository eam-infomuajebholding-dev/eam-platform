#!/usr/bin/env bash
# Oracle Cloud — Step 1: prepare Ubuntu 22.04 (Jeddah VM).
# Run on the server: curl -fsSL .../oracle-server-setup.sh | sudo bash
# Or: scp deploy/scripts/oracle-server-setup.sh ubuntu@IP:~ && sudo bash oracle-server-setup.sh

set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get upgrade -y
apt-get install -y ca-certificates curl git ufw certbot

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

apt-get install -y docker-compose-plugin || true

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "=== EAM server ready ==="
echo "Docker:  $(docker --version)"
echo "Compose: $(docker compose version 2>/dev/null || echo 'install docker-compose-plugin')"
echo ""
echo "Next (Step 2): run deploy/scripts/deploy.sh from eam-platform repo"
echo "SSL: use Cloudflare proxy on eam.sa, or certbot after deploy (see deploy/ORACLE-DEPLOY.md)"
