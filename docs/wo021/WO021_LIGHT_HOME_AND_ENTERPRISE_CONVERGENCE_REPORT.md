# WO-021 — Light Homepage & Enterprise Convergence (Final)

**Date:** 2026-09-12  
**Branch:** `feature/frontend-wo001-hero`  
**Controller:** EAM-P2-COMPLETE-REMAINING-ENTERPRISE-PLATFORM-008

## Repository snapshot

```
START_HEAD=1781a59
END_HEAD=0ebb285
BRANCH=feature/frontend-wo001-hero
REMOTE_STATE=pushed post-commit
WORKTREE=INTENTIONALLY_DIRTY
  app/frontend/screenshots/ — local visual evidence (not staged)
```

## Toolchain & database

```
PNPM_VERSION=9.15.4
PNPM_WORKSPACE_ARTIFACT=gitignored (not staged)
LOCAL_LINT=PASS

ALEMBIC_HEAD=t0u1v2w3x4y5
ALEMBIC_CURRENT=t0u1v2w3x4y5
ALEMBIC_HEAD_COUNT=1
```

## CI

```
CI_VERIFIED_BASELINE=run 34633471478 @ 7a62c4f
CI_FINAL_HEAD_STATUS=NEEDS_VERIFICATION (homepage final delta post-1781a59)
```

## Test convergence (fresh)

| Gate | Result |
|------|--------|
| BACKEND_TESTS | **214/214 PASS** |
| AI_SECURITY_TESTS | not re-run this delta |
| COMMERCIAL_SECURITY_TESTS | not re-run this delta |
| LINT | **PASS** |
| TYPECHECK | NO_CANONICAL_COMMAND |
| BUILD | **PASS** |
| PLAYWRIGHT_HOMEPAGE_PACK | **19/19 PASS** (geometry 5 + full-page 7 + light 3 + visual 1 + re-run geometry 5 overlap excluded) |
| PLAYWRIGHT_FULL_LOCAL | not re-run full 79-pack this delta |
| HOME_E2E | **PASS** (`homepage-light.spec.ts`) |
| CONSOLE_GATE | not dedicated this delta |

## Homepage light — final gates

```
HOMEPAGE_LIGHT=PASS
HEADER=PASS (Layout nav — logo, RTL links, auth actions)
HERO=PASS (local hero-architecture.png + H1 من الفكرة إلى الأثر)
EAM_AI=PASS (HomeAIWorkspace → HeroChat + QuickActions)
QUICK_SUGGESTIONS=PASS (B09-aligned routes + build-villa action)
TRUST_INDICATORS=PASS (qualitative pillars — no +250/98% claims)
SECTOR_CAROUSEL=PASS (HorizontalMarquee + canonical 16 sectors)
ABOUT_EAM=PASS (two-column + values + replaceable media)
FEATURED_PROJECTS=PASS
INVESTMENT_CTA=PASS (no guaranteed returns)
FINAL_CONTACT_CTA=PASS (truthful — links to /contact, no fake newsletter API)
FOOTER_COUNT=1

REMOVED_EAM_MARKET=YES (not on Index)
REMOVED_INSIGHTS=YES
REMOVED_BLOG_FROM_HOME=YES
REMOVED_PARTNERS=YES
REMOVED_OLD_CARD_ROW=YES (27/42/27 dashboard + post-hero quick-link row)

NEW_SCROLL_HEIGHT=4525 (1586×992 natural content)
H1_COUNT=1
HORIZONTAL_OVERFLOW=PASS
BROKEN_IMAGES=not detected in gate

DESKTOP_SCREENSHOT=app/frontend/screenshots/wo021-home-desktop-1586x992.png
TABLET_SCREENSHOT=app/frontend/screenshots/wo021-home-tablet-768x1024.png
MOBILE_SCREENSHOT=app/frontend/screenshots/wo021-home-mobile-390x844.png

TECHNICAL_VISUAL_GATE=PASS
USER_VISUAL_ACCEPTANCE=APPROVED_BY_USER (2026-09-12; incremental trust/sector-source refinements post-approval)
```

## Architecture notes

- **Sector source:** single registry `src/data/sectors.ts` consumed by carousel (`SectorPlatformStrip`) and grid (`HomePlatformsGridSection`).
- **AI path:** Home UI → `HomeAIWorkspace` → `HeroChat` / `WorkspaceProvider` → AI Core (no second assistant).
- **Legacy inactive:** `SolutionsSection.tsx` (duplicate 6-item catalog) — superseded, not deleted (UNKNOWN cleanup policy).

## Journeys & blocked commercial

```
REAL_JOURNEY_COUNT=13
JOURNEY_03=BLOCKED_UPSTREAM (Investment)
JOURNEY_12=BLOCKED_UPSTREAM (Factories & Suppliers)
JOURNEY_16=BLOCKED_UPSTREAM (Delivery & Owner)

QUOTE=DONE (V1 draft→issued)
QUOTE_ACCEPTANCE=BLOCKED_BUSINESS_DECISION
CONTRACT=BLOCKED_UPSTREAM
PAYMENT=BLOCKED_UPSTREAM
OPERATIONAL_PROJECT=BLOCKED_UPSTREAM
```

## Command Center / platform readiness

```
COMMAND_CENTER=PARTIAL (foundation + evidence drawer V2 fields)
EVIDENCE_DRAWER=PARTIAL
DECISION_INBOX=PARTIAL
FINANCE=NOT_AVAILABLE

OIDC=BLOCKED_EXTERNAL
M1=PARTIAL
BACKUP=PARTIAL (see BACKUP_RESTORE_READINESS.md)
RESTORE=PARTIAL (DEV drill only)
```

## Software engineering scorecard (summary)

| Dimension | Status |
|-----------|--------|
| DOMAIN_ORGANIZATION | PASS |
| AUTHORITY_CLARITY | PASS |
| RESPONSIBILITY_CLARITY | PASS |
| DUPLICATION | PARTIAL (SolutionsSection legacy file remains) |
| CHANGE_LOCALITY | GOOD (home feature bounded) |
| TESTABILITY | PASS |
| PRODUCTION_READINESS | PARTIAL |

```
SOFTWARE_ENGINEERING_ACCEPTANCE=PARTIAL
PRODUCTION_READINESS=PARTIAL
```

## Next work

```
NEXT_READY_NOW=CI verification on HEAD; Command Center evidence polish; OIDC prerequisite naming
NEXT_BLOCKED_BUSINESS_DECISION=Quote Acceptance meaning
NEXT_BLOCKED_UPSTREAM=Investment, Suppliers, Delivery journeys; Contract; Payment
NEXT_BLOCKED_EXTERNAL=OIDC client secret
NEXT_DEFERRED_JIT=OperationalProject, Opportunity BO, Supplier BO
```
