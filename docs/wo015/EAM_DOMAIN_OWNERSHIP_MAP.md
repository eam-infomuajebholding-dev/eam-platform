# EAM Domain Ownership Map

Purpose: reduce tribal knowledge. Each domain owns one coherent responsibility.

## Journeys (`app/backend/services/jos*.py`, `app/frontend/src/features/journeys/`)

- **Purpose:** Adaptive customer intake → First Value → review → submit
- **Authority:** JOS (state); SR service (formal request)
- **Contracts:** Journey type enums, step transitions, intake validators
- **Dependencies:** Auth, AI Core (intent), Tool Gateway (start), SR
- **Forbidden:** Business rules in page components; duplicate journey registries

## AI Core (`app/backend/services/ai_core.py`, `ai/`, `app/frontend/src/features/ai/`)

- **Purpose:** Classification, guidance, structured proposals
- **Authority:** AI Core + Prompt Registry + Tool Gateway/Policy
- **Contracts:** Intent schemas, tool execute API, actionExecutor (frontend)
- **Forbidden:** Direct journey state mutation; frontend provider calls

## Service Requests (`service_requests.py`, Workspace, Professional Review)

- **Purpose:** Immutable submitted intake, review workflow, RFI
- **Authority:** Single SR service + status machine
- **Forbidden:** Per-journey request tables; fabricated progress

## Command Center (`command-center/`, `operations_dashboard.py`, read models)

- **Purpose:** Owner decision & control (read plane)
- **Authority:** Backend read models for metrics; no business writes
- **Forbidden:** Parallel business database; frontend KPI calculation

## CMS / Editorial

- **Purpose:** Marketing content, projects showcase (editorial)
- **Authority:** CMS persistence
- **Forbidden:** Treating CMS project as operational project

## Auth

- **Purpose:** Identity, sessions, role gates
- **Authority:** Auth middleware + routers
- **Forbidden:** Second auth system; UI-only authorization

## Sector registry (`app/frontend/src/data/sectors.ts`)

- **Purpose:** Canonical 16-sector labels, slugs, imagery paths
- **Authority:** Single registry file (+ mirrored labels in backend search)
- **Forbidden:** Hard-coded sector lists in journey modules

## Real Estate Development (WO-015)

- **Backend:** `real_estate_development_validators.py`, JOS seed, migration `p6q7r8s9t0u1`
- **Frontend:** `features/journeys/real-estate-development/`
- **Route:** `/journeys/real-estate-development`
- **SR prefix:** `RD-`
