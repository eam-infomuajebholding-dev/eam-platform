# How to Add an EAM Journey Safely

> Extended from `docs/wo017/JOURNEY_ENGINEER_GUIDE.md`

## Checklist

1. **Business Lab** — confirm no BLOCKED business decisions
2. **Validators** — `app/backend/services/<journey>_validators.py`
3. **JOS workflow** — `jos_seed.py` + `DEFAULT_DEFINITIONS`
4. **JOS service** — branch in `jos.py` (validate, brief, complete)
5. **Service Request** — prefix, request_type, snapshot branch
6. **AI intent** — `intent_router.py`, `ai_core_intents.py`, golden set
7. **Migration** — Alembic from current single head
8. **Frontend** — `features/journeys/<slug>/` (5 files typical)
9. **Wiring** — App route, SectorPage, HeroChat, WorkspaceContext, IntakeSnapshotSummary
10. **Tests** — backend journey test, flow helper, E2E spec
11. **Update head test** — `test_single_alembic_head`

## Invariants

- First Value = **PRELIMINARY** only
- No fabricated prices, ROI, market stats, approvals
- JOS owns state; one SR on complete
- Duplicate active journey blocked

## Reference journeys

See table in `docs/wo017/JOURNEY_ENGINEER_GUIDE.md`.
