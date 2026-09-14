# Architecture Drift Register

| ID | Drift | Severity | Resolution |
|----|-------|----------|------------|
| DRIFT-001 | `IntakeSnapshotSummary` growing per-journey switches | P2 | Extract field primitives when 16 journeys stable |
| DRIFT-002 | `jos.py` central journey-type switch | P1 accepted | Modular monolith pattern until factory justified |
| DRIFT-003 | Dev DB Alembic behind head | P1 ops | Run `upgrade head` |
| DRIFT-004 | WO-016 packet docs reference stale counts | P3 docs | Superseded by wo016 reports |
| DRIFT-005 | Some frontend raw `fetch` outside `lib/api` | P3 | Converge in cleanup WO |
| DRIFT-006 | `WorkspaceContext` holds 13× journey step state + advance/complete | **P0** | Phase 1 — Conversation Shell (`ADR-GLOBAL-EAM-COPILOT.md`) |
| DRIFT-007 | `HeroChat` embeds parallel journey panel tree | **P1** | Phase 3–5 — `JourneyDockPanel` + `useSectorJourneyPage` |
| DRIFT-008 | No `AssistantRouteContext`; route treated as implicit journey context | **P1** | Phase 2 — derived context provider |
| DRIFT-009 | Command Center assistant separate from Global Copilot | **P2** | Phase 6 — single entry, role context |

See `docs/engineering/GLOBAL_COPILOT_MIGRATION_AUDIT.md` for Phase 0 inventory.
