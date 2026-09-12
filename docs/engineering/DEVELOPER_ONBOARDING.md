# EAM Developer Onboarding

## Requirements

- Node.js 20+ (frontend)
- **pnpm 9.15.4** (canonical — matches CI; use Corepack)
- Python 3.11+ (backend)
- Git

## Setup

```powershell
# Enable canonical pnpm (once per machine)
corepack enable
corepack prepare pnpm@9.15.4 --activate

# Backend
Set-Location C:\Projects\eam-platform\app\backend
pip install -r requirements.txt
python -m alembic upgrade head

# Frontend
Set-Location C:\Projects\eam-platform\app\frontend
pnpm install --frozen-lockfile
```

> **Note:** pnpm 11 may generate `pnpm-workspace.yaml` locally — this file is **gitignored** and must not be committed. Use pnpm 9 per `packageManager` in `package.json`.

## Environment variables

See `.env.example` files (names only — never commit secrets):

- `JWT_SECRET_KEY`
- Database URL (backend)
- OIDC client settings (when available)

## Run (Windows)

See `docs/engineering/WINDOWS_RUNBOOK.md`

**Rule:** Check `http://127.0.0.1:8000/health` before starting backend.

## Tests

```powershell
# Backend focused
python -m pytest tests/test_real_estate_development_journey.py -q

# Backend full (after convergence)
python -m pytest -q

# Frontend
pnpm run lint
pnpm run build
pnpm exec playwright test
```

## E2E authentication

Visual/admin Playwright specs require JWT alignment with running backend. See `docs/engineering/E2E_TEST_AUTH.md`.

## Architecture entry points

- Authorities: `docs/engineering/AUTHORITY_MAP.md`
- Journeys: `docs/wo017/JOURNEY_ENGINEER_GUIDE.md`
- Commercial: `docs/commercial-architecture.md`
- Blockers: `docs/roadmap/EAM_REMAINING_WORK_REGISTER.md`

## Common issues

| Symptom | Check |
|---------|-------|
| Port 8000 in use | Health check first; inspect PID |
| Migration errors | `alembic current` vs `alembic heads` |
| 401 on API | JWT / auth headers |
| Frontend blank | Vite compile errors in terminal |
