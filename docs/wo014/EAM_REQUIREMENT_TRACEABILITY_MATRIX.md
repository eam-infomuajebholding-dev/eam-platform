# EAM Requirement Traceability Matrix (WO-014)

| ID | Requirement | Implementation | Authority | Test | Status | Blocker |
|----|-------------|----------------|-----------|------|--------|---------|
| WO014-CC-AI | Executive AI via AI Core | `ExecutiveAIService` + `/executive-brief` | AI Core | `test_command_center_wo014.py` | DONE_VERIFIED | Live provider env-dependent |
| WO014-CC-EV | Evidence Drawer | `/evidence/{metric_id}` + `EvidenceDrawer.tsx` | Read model + METRIC_CATALOG | command-center E2E | DONE_VERIFIED | — |
| WO014-CC-SRCH | Command Search | `/search` + `CommandSearchBar.tsx` | Deterministic search | `test_command_center_wo014.py` | DONE_VERIFIED | AI ASK path partial |
| WO014-J09 | Journey #09 Government Services | Full vertical slice GS-* | JOS + SR | backend + E2E | DONE_VERIFIED | — |
| WO014-PW | Full Playwright stabilization | M1 + homepage fixes | — | full suite | PARTIAL | Full run required each convergence |
| WO014-WL | Watchlist | — | — | — | DEFERRED_JIT | No clean persistence |
| WO014-DJ | Decision Journal BO | — | — | — | DEFERRED_JIT | No durable decision model |
| WO014-QUOTE | Quote BO | — | Commercial | — | BLOCKED_BUSINESS_DECISION | Business Lab |
| WO014-OIDC | Authenticated acceptance | OIDC callback | Auth | M1 smoke | BLOCKED_EXTERNAL | Provider credentials |
