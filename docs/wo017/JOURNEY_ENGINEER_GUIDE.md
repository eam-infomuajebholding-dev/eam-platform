# EAM Journey Engineer Guide (M1 vertical slice)

## Adding a new REAL journey

1. **Validators** — `app/backend/services/<journey>_validators.py`  
   - Step validation, `assemble_*_brief()`, `assemble_*_intake_draft()`
2. **JOS seed** — `jos_seed.py`: workflow + `DEFAULT_DEFINITIONS` + `UPSERT_JOURNEY_TYPES`
3. **JOS service** — `jos.py`: duplicate guard, validate branch, brief at brief step, intake at `intake_complete`, events, complete guard
4. **Service Request** — prefix, request_type, `_build_intake_snapshot()` branch
5. **AI** — `intent_router.py`, `ai_core_intents.py`, `schemas/ai_intent.py`
6. **Migration** — Alembic upsert definition (chain from current head)
7. **Frontend** — `src/features/journeys/<slug>/` (5 files) + App route + SectorPage + HeroChat + WorkspaceContext + IntakeSnapshotSummary
8. **Tests** — backend journey test + flow helper + E2E spec + intent golden cases

## Invariants

- First Value = **PRELIMINARY** brief only — no fabricated prices, ROI, leads, or supplier quotes
- JOS owns state; AI routes only; SR created on `complete()`
- One active instance per identity (duplicate guard)

## Reference implementations

| Journey | journey_type | SR prefix | Brief step |
|---------|--------------|-----------|------------|
| Marketing | `real_estate_marketing` | RM | `marketing_readiness_brief` |
| Materials | `building_materials` | BM | `procurement_readiness_brief` |
| Equipment | `equipment` | EQ | `equipment_readiness_brief` |
