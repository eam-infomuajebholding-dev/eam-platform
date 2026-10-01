#!/usr/bin/env bash
# Oracle Cloud — Step 2: clone/update eam-platform and start Docker stack.
set -euo pipefail

REPO_URL="${EAM_REPO_URL:-https://github.com/eam-infomuajebholding-dev/eam-platform.git}"
REPO_DIR="${EAM_REPO_DIR:-$HOME/eam-platform}"
BRANCH="${EAM_BRANCH:-main}"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH" 2>/dev/null || git checkout feature/frontend-wo001-hero
git pull --ff-only || git pull

if [[ ! -f app/.env ]]; then
  cp app/.env.example app/.env
  echo "Created app/.env — edit JWT, OIDC, Stripe, FRONTEND_URL=https://eam.sa"
fi

if [[ ! -f deploy/.env ]]; then
  cp deploy/.env.oracle.example deploy/.env
fi

exec bash deploy/deploy-eam.sh
