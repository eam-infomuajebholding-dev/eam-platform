# EAM Developer Onboarding

## Requirements

- Node.js + npm (frontend)
- Python 3.11+ (backend)
- Git

## Setup

```powershell
# Backend
Set-Location C:\Projects\eam-platform\app\backend
pip install -r requirements.txt
python -m alembic upgrade head

# Frontend
Set-Location C:\Projects\eam-platform\app\frontend
npm install
```

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
npm run lint
npm run build
npx playwright test
```

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
