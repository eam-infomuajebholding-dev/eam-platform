# Architecture Drift Register

| ID | Drift | Severity | Resolution |
|----|-------|----------|------------|
| DRIFT-001 | `IntakeSnapshotSummary` growing per-journey switches | P2 | Extract field primitives when 16 journeys stable |
| DRIFT-002 | `jos.py` central journey-type switch | P1 accepted | Modular monolith pattern until factory justified |
| DRIFT-003 | Dev DB Alembic behind head | P1 ops | Run `upgrade head` |
| DRIFT-004 | WO-016 packet docs reference stale counts | P3 docs | Superseded by wo016 reports |
| DRIFT-005 | Some frontend raw `fetch` outside `lib/api` | P3 | Converge in cleanup WO |

No P0 authority duplication confirmed.
