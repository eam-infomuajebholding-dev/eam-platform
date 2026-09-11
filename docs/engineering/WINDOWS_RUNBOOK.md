# EAM Windows Runbook (PowerShell)

## Backend health (always first)

```powershell
curl.exe http://127.0.0.1:8000/health
```

If `200` and `{"status":"healthy"}` → **do not start another uvicorn**.

## Start backend (only if unhealthy)

```powershell
Set-Location C:\Projects\eam-platform\app\backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## Start frontend

```powershell
Set-Location C:\Projects\eam-platform\app\frontend
npm run dev
```

Default: http://127.0.0.1:3000

## Migration check

```powershell
Set-Location C:\Projects\eam-platform\app\backend
python -m alembic heads
python -m alembic current
python -m alembic upgrade head
```

## Focused tests (WO-016A)

```powershell
Set-Location C:\Projects\eam-platform\app\backend
python -m pytest tests/test_real_estate_development_journey.py -q
```

## Full gates (after convergence only)

```powershell
python -m pytest -q
Set-Location ..\frontend
npm run lint
npm run build
npx playwright test
```

## Port conflict diagnosis

```powershell
netstat -ano | findstr ":8000"
netstat -ano | findstr ":3000"
```

Inspect PID before terminating. Never kill unknown PID blindly.

## What `/health` proves

- Backend process responding
- App import successful

## What `/health` does NOT prove

- Database migration at head
- OIDC provider availability
- AI provider availability
- Frontend/backend version match
