# Global EAM Copilot — Migration Audit (Phase 0)

**Date:** 2026-09-13  
**ADR:** `ADR-GLOBAL-EAM-COPILOT.md`  
**Rule:** No removals until each row has a migration target and consumer update plan.

## Summary

| Category | Finding | Severity | Phase |
|----------|---------|----------|-------|
| Duplicate journey step state | 13× `*StepValues` in `WorkspaceContext` | **P0** | 1 |
| Duplicate advance/complete logic | `advanceCurrentStep`, `completeCurrentJourney` in workspace | **P0** | 1–3 |
| Parallel `currentInstance` hydration | Workspace + `JourneyContext` both track instance | **P1** | 1 |
| HeroChat embeds all 13 panels | Direct panel imports + workspace step bindings | **P1** | 3–5 |
| No `AssistantRouteContext` | Context not sent uniformly to AI Core | **P1** | 2 |
| Route vs JOS conflict UX | Not implemented | **P2** | 4 |
| Command Center separate assistant | Excluded from global dock | **P2** | 6 |
| Resume from assistant | `journey.resume` in gateway; UI partial | **P2** | 4 |
| Funnel analytics | Not instrumented end-to-end | **P3** | 8 |
| Proactive nudges | Not started (by design) | **P3** | 9 |

---

## A. Authoritative state violations

### A1. `WorkspaceContext.tsx` (~1250 lines)

**File:** `app/frontend/src/features/ai-workspace/WorkspaceContext.tsx`

| State / API | Lines (approx) | Violation | Migration target |
|-------------|----------------|-----------|------------------|
| `stepValues` + `setStepValues` (build-villa) | 684, 1170 | Authoritative step cache | Remove; use `useJourneyPage` or read-only sync from JOS |
| `ecStepValues` … `eqStepValues` (12 more) | 685–698 | Same | Same |
| `currentInstance` local tracking | 666, 715–770 | Duplicates `JourneyContext` | Read from `JourneyContext` only |
| `advanceCurrentStep` | 986–1072 | Duplicates journey core + 13× `build*AdvanceInput` | Delegate to `useJourneyPage` or Tool Gateway `journey.advance` |
| `completeCurrentJourney` | 1128–1159 | Duplicates journey page complete | Same |
| `revisitCurrentSection` | 1076–1091 | BV-only in workspace | `useJourneyPage.revisit` |
| `exitCurrentJourney` | 1095–1125 | Pause/clear local | JOS pause + clear derived UI |
| Per-sector context casts (13×) | 700–712 | Derived from instance — OK if read-only | Keep as derived only after step state removal |
| `useJourney()` inside workspace | 675 | OK for API access | Keep; do not duplicate state above it |

**Imports to remove in Phase 1–3:** all sector `build*AdvanceInput`, `empty*StepValues`, `sync*FromContext` from workspace (already centralized in journey `errors.ts` / `useJourneyPage`).

### A2. `HeroChat.tsx`

**File:** `app/frontend/src/components/sections/Hero/HeroChat.tsx`

| Pattern | Violation | Migration target |
|---------|-----------|------------------|
| Imports 13 `*StepPanel` components | Parallel journey UI tree | Single `JourneyDockPanel` wrapper using `journeyCatalog` + sector panel |
| Binds `stepValues` / `setStepValues` per sector | Workspace-owned state | Props from journey runtime hook |
| Calls `advanceCurrentStep` from workspace | Duplicate mutation path | Hook from `useSectorJourneyPage` scoped to dock |

**Keep in HeroChat (Conversation Shell):** messages, streaming, input, `sendMessage`, action acceptance, interaction mode toggle.

---

## B. Already aligned (do not regress)

| Asset | Status |
|-------|--------|
| `GlobalAssistantDock` + `assistant.ts` exclusions | ✅ Platform-wide dock; payment/auth excluded |
| `actionExecutor.ts` → `journey.start`, `human_handoff.request` | ✅ Tool Gateway path |
| `JourneyContext` + `josClient` | ✅ Authoritative frontend bridge to JOS |
| `useSectorJourneyPage` / `useJourneyPage` | ✅ Canonical page runtime (13 sectors) |
| `journeyCatalog.ts` | ✅ Sector metadata for routing/runtime |
| `JourneyStepPanelShell` | ✅ Shared panel chrome |
| `docs/tool-gateway-architecture.md` | ✅ Backend contract documented |

---

## C. Missing capabilities (greenfield in ADR phases)

### C1. `AssistantRouteContext` (Phase 2)

Proposed shape:

```typescript
interface AssistantRouteContext {
  route: string;
  presentationSectorId: string | null;  // from URL/marketing context
  locale: string;
  authState: 'anonymous' | 'authenticated';
  // Authoritative (from JOS / Business Services — read-only in UI)
  activeJourneyInstanceId: number | null;
  activeJourneyType: string | null;
  activeStepKey: string | null;
  serviceRequestId: number | null;
  quoteId: number | null;
  paymentSessionId: string | null;
  // Derived mode
  contextMode: 'GUIDE' | 'NAVIGATOR' | 'OPERATOR' | 'MINIMAL';
  routeJosConflict: boolean;
}
```

**Consumers:** AI Core turn payload, mode resolver, resume prompts.

### C2. Route vs JOS conflict (Phase 4)

| Signal | Source |
|--------|--------|
| URL sector | `presentationSectorId` from route |
| Active journey type | JOS `currentInstance.journey_type` |
| Conflict | `presentationSectorId !== catalogSectorFor(journeyType)` |

Assistant copy pattern: «أنت في صفحة {A}، لكن لديك رحلة {B} نشطة — هل تريد المتابعة؟»

### C3. Tool Gateway tools (backend — verify availability)

| Tool | Needed for |
|------|------------|
| `journey.start` | ✅ exists |
| `journey.resume` | Resume prompt |
| `journey.read_state` | Authoritative context without UI state |
| `journey.advance` | Optional server-side advance (policy) |
| `human_handoff.request` | ✅ exists — extend with SLA/SR linkage |

---

## D. Consumer map

| Consumer | Uses workspace journey state? | Phase 1 action |
|----------|--------------------------------|----------------|
| `HeroChat.tsx` | **Yes** — primary | Refactor last (needs bridge) |
| `HomeAIWorkspace.tsx` | No — shell only | No change |
| `GlobalAssistantDock.tsx` | No | Add mode resolver later |
| Journey pages (`SectorJourneyPage`) | No — uses `useSectorJourneyPage` | Source of truth for runtime |
| `CommandCenterAssistantPanel` | TBD | Audit separately; converge to global entry |

---

## E. Recommended migration order (Phase 1 slice)

1. **Extract** `ConversationShellContext` from workspace (messages, sendMessage, streaming, action dispatch) — no step state.
2. **Add** `useAssistantJourneyBridge(sectorId?)` — thin wrapper over `useJourneyPage` for dock embedding.
3. **Replace** one sector in HeroChat (pilot: `equipment` — smallest panel) to validate bridge.
4. **Roll out** remaining 12 sectors panel-by-panel.
5. **Delete** step state and advance methods from `WorkspaceContext`.
6. **Add** `AssistantRouteContext` provider at `App` level (derived, read-only).

---

## F. Test checklist (per phase)

- [ ] Start journey from chat → JOS instance created; no local step cache
- [ ] Advance step in dock → same instance updates as `/journeys/{sector}`
- [ ] Navigate away and back → resume from JOS, not workspace memory
- [ ] Route/JOS conflict message when sectors differ
- [ ] Payment/auth routes → MINIMAL mode only
- [ ] Complete journey → SR creation unchanged
- [ ] `pnpm exec tsc --noEmit` clean

---

## G. Drift register entries

Logged in `ARCHITECTURE_DRIFT_REGISTER.md` as DRIFT-006 through DRIFT-009.
