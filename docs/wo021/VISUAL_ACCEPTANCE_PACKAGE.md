# Owner Visual Acceptance Package (WO-021)

**Status:** USER_VISUAL_ACCEPTANCE=AWAITING_USER  
**Do not self-approve.**

## Reference viewport

**1586 × 992** (desktop primary)

## Automated geometry gate

| Check | Result (WO-021 session) |
|-------|-------------------------|
| `homepage-geometry.spec.ts` | **PASS** (11 tests in CI canonical pack) |
| 27/42/27 column layout | Verified via geometry thresholds |
| Horizontal overflow | PASS |
| Single H1 / single Footer | Verified in ui-structure tests |
| Sector rail visibility | PASS |

## Current evidence files (local — untracked)

| Path | Dimensions | Classification |
|------|------------|----------------|
| `screenshots/homepage-section01-baseline-1586x992.png` | 1586×992 | CANONICAL_VISUAL_REFERENCE |
| `screenshots/homepage-section01-fit-1586x992.png` | 1586×992 | CURRENT_ACCEPTANCE_EVIDENCE |
| `screenshots/homepage-section01-precision-1586x992.png` | 1586×992 | CURRENT_ACCEPTANCE_EVIDENCE |
| `screenshots/homepage-section01-after-1586x992.png` | 1586×992 | HISTORICAL_WO_EVIDENCE |
| `screenshots/homepage-section01-before-1586x992.png` | 1586×992 | HISTORICAL_WO_EVIDENCE |
| `screenshots/section01-width/before-1586x992.png` | 1586×992 | HISTORICAL_WO_EVIDENCE |
| `screenshots/section01-width/after-1586x992.png` | 1586×992 | HISTORICAL_WO_EVIDENCE |
| `screenshots/homepage-section01-fit-1280x800.png` | 1280×800 | TEST_ARTIFACT (responsive) |
| `screenshots/homepage-section01-fit-1739x1082.png` | 1739×1082 | TEST_ARTIFACT |
| `screenshots/homepage-section01-fit-1920x1200.png` | 1920×1200 | TEST_ARTIFACT |
| `screenshots/wo012-command-center-desktop.png` | 1440×900 | WO_EVIDENCE |
| `screenshots/wo012-command-center-mobile.png` | 390×844 | WO_EVIDENCE |
| `screenshots/wo006-*`, `wo007-*` | various | HISTORICAL_WO_EVIDENCE (journeys) |

**Disposition:** Directory remains **untracked** intentionally. Do not commit wholesale.

## Visual comparison summary

| Aspect | Reference | Current | Assessment |
|--------|-----------|---------|------------|
| Column ratio | 27/42/27 | Geometry tests within ~5% | No major geometry regression |
| HeroChat / emblem | Protected architecture | Present | INTENTIONAL |
| Sector rail | Horizontal scroll | Present | INTENTIONAL |
| Legacy video homepage | Removed | Not present | INTENTIONAL |

**Major differences:** None detected by automated geometry gate vs baseline thresholds.  
**Minor differences:** Pixel-level drift possible between baseline captures and live dev server — owner eye required.

## Owner review checklist

- [ ] Homepage desktop 1586×992 matches approved brand layout
- [ ] Command Center desktop readable for leadership use
- [ ] Tablet/mobile homepage acceptable (optional responsive captures)
- [ ] Console clean on `/` and `/command-center` (admin)

## Routes to verify manually

- `/`
- `/contact`
- `/contact-card`
- `/command-center` (admin session)
