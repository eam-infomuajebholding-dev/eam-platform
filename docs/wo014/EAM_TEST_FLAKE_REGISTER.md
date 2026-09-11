# EAM Test Flake Register

| Test | Symptom | Root Cause | Classification | Fix | Status |
|------|---------|------------|----------------|-----|--------|
| `homepage-full-page` scroll | scrollHeight assert fail | Images/fonts loading | TIMING_ASSUMPTION | Wait footer + scrollHeight | FIXED |
| `m1-auth-smoke` reload | City placeholder after project_intent | Resume step varies | TEST_ISOLATION | OR locator for city/intent | FIXED |
| `m1-browser` Flow B/C | Placeholder `500` not found in HeroChat | 15-step BV + spinbutton a11y | OBSOLETE_TEST | Full path + workspace scope | FIXED |
| `m1-browser` Flow C | 180s timeout on land_area | HeroChat controlled input | TEST_ISOLATION | Dedicated `/journeys/build-villa` route | FIXED |
| `project-management` full path | Timeout on timeline field | Missing step transition wait | TIMING_ASSUMPTION | Assert `الجدول الزمني` heading | FIXED |
| `command-center-visual` | CC heading timeout under parallel load | Backend contention | TEST_ISOLATION_FAILURE | Passes isolated; full suite green after M1 fix | CLOSED |
| `herochat-intent` contracting | Intent panel not visible | Parallel worker timing | TEST_ISOLATION_FAILURE | Passes isolated; suite green | CLOSED |
| M1 Flow A/C/D authenticated | Cannot complete OIDC | No E2E credentials | EXTERNAL_DEPENDENCY | Status BLOCKED in test JSON | CLASSIFIED |
