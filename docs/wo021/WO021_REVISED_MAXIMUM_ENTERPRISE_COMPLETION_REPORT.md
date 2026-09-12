# WO-021 Revised — Maximum Enterprise Completion Report

**Date:** 2026-09-12  
**Supersedes:** prior WO-021 draft scope where overlapping  
**Branch:** `feature/frontend-wo001-hero`

## Repository

```
START_HEAD=6f8f693
END_HEAD=(pending commit)
BRANCH=feature/frontend-wo001-hero
REMOTE_STATE=pushed @ 6f8f693 (pre-homepage commit)
WORKTREE=INTENTIONALLY_DIRTY
  app/frontend/screenshots/ — visual evidence (includes wo021-homepage-light-1586x992.png)
```

## Database

```
ALEMBIC_HEAD=t0u1v2w3x4y5
ALEMBIC_CURRENT=t0u1v2w3x4y5
ALEMBIC_HEAD_COUNT=1
```

## CI

```
CI_VERIFIED_BASELINE=run 34633471478 @ 7a62c4f
CI_FINAL_HEAD_STATUS=NEEDS_VERIFICATION (homepage + prior WO-021 commits)
```

## Package manager

```
PNPM_CANONICAL_VERSION=9.15.4
PNPM_LOCAL_ARTIFACT_STATUS=gitignored; corepack 9.15.4 active locally
```

## Tests (fresh)

| Gate | Result |
|------|--------|
| BACKEND_TESTS | **214/214 PASS** |
| LINT | **PASS** |
| BUILD | **PASS** |
| PLAYWRIGHT_HOMEPAGE_LIGHT | **5/5 PASS** |
| PLAYWRIGHT_STRUCTURE+M1 | **6/6 PASS** (subset this session) |
| TYPECHECK | NO_CANONICAL_COMMAND |

## Homepage light redesign

```
HOMEPAGE_LIGHT_VERSION=IMPLEMENTED
HERO=PASS (من الفكرة إلى الأثر + skyline imagery)
EAM_AI=PASS (HeroChat + QuickActions preserved)
HERO_IMAGE=PASS (presentation skyline — HOME_HERO_IMAGE)
SECTOR_RAIL=PASS (canonical 16-sector moving rail)
ABOUT_EAM=PASS
SERVICES=PASS (حلول متكاملة...)
PROJECTS=PASS (أبرز المشاريع)
INVESTMENT=PASS (promotional — no guaranteed returns)
FINAL_CTA=PASS (HomeContactSection)
FOOTER_COUNT=1

REMOVED_EAM_MARKET=YES (never on Index route)
REMOVED_INSIGHTS=YES
REMOVED_PARTNERS=YES
REMOVED_OLD_POST_HERO_CARD_ROW=YES (27/42/27 dashboard removed)
REMOVED_OLD_DASHBOARD=YES

OLD_SCROLL_HEIGHT=not asserted (superseded geometry)
NEW_SCROLL_HEIGHT=3978 (1586×992 full-page capture)

H1_COUNT=1
HORIZONTAL_OVERFLOW=PASS
BROKEN_IMAGES=not detected in gate
CONSOLE_ERRORS=not re-run dedicated gate

DESKTOP_SCREENSHOT=app/frontend/screenshots/wo021-homepage-light-1586x992.png
TECHNICAL_VISUAL_GATE=PASS
USER_VISUAL_ACCEPTANCE=AWAITING_USER
```

## Journeys (16)

```
REAL_JOURNEY_COUNT=13
JOURNEY_01..02,04..11,13..15=DONE_VERIFIED
JOURNEY_03,12,16=BLOCKED_UPSTREAM
```

## Commercial

```
QUOTE=DONE_VERIFIED
QUOTE_ACCEPTANCE=BLOCKED_BUSINESS_DECISION
CONTRACT/PAYMENT/OPERATIONAL_PROJECT=BLOCKED_UPSTREAM
```

## Command Center / AI

Prior WO-021 stream items retained (E2E auth helper, Evidence Drawer V2 fields).

## Production

```
OIDC=BLOCKED_EXTERNAL (OIDC_CLIENT_SECRET absent)
M1=PARTIAL
BACKUP/RESTORE=NOT_CONFIGURED
PRODUCTION_READINESS=PARTIAL
USER_VISUAL_ACCEPTANCE=AWAITING_USER
```

## Acceptance layers

```
PRODUCT_ACCEPTANCE=PASS (13 journeys + light homepage USER gate pending)
ENGINEERING_ACCEPTANCE=PASS
SOFTWARE_ENGINEERING_ACCEPTANCE=PARTIAL (full local Playwright env for CC visual)
PRODUCTION_READINESS=PARTIAL
```

## NEXT

```
NEXT_READY_NOW=
  1. Owner visual approval (light homepage screenshot)
  2. Business Lab Quote acceptance pack
  3. CI on new HEAD

NEXT_BLOCKED_BUSINESS_DECISION=Quote acceptance, Payment
NEXT_BLOCKED_UPSTREAM=Investment, Suppliers, Delivery journeys
NEXT_BLOCKED_EXTERNAL=OIDC_CLIENT_SECRET
```
