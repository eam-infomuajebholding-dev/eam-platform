# Journey Shared Mechanics (#04 + #08 + #09 + #05 + #13 + #07 + #15)

## Shared (confirmed — 7-consumer baseline)

| Mechanic | Location | Used by |
|----------|----------|---------|
| JourneyContext / useJourney | `features/journeys/core/` | BV, EC, Contracting, Valuation, Smart Maintenance, PM, Furnishing, HeroChat |
| PreliminaryBriefCard | `features/journeys/core/PreliminaryBriefCard.tsx` | All real journeys + SR snapshot |
| JourneyShell | `features/journeys/core/JourneyShell.tsx` | All real journeys |
| JourneyProgress | `features/journeys/core/JourneyProgress.tsx` | JourneyShell |
| Session hydration | `JourneyContext` + type-aware session keys | All real journeys |
| Action executor | `features/ai-workspace/actionExecutor.ts` | HeroChat START_JOURNEY → Tool Gateway |

## Domain-specific (not shared)

- Step schemas and validators (backend per journey)
- Step panels and field UI
- Advance input builders and error maps
- Workflow definitions in JOS seed

## Rules for new journeys

1. Start via canonical JOS API / Tool Gateway — never frontend state machine.
2. Reuse `PreliminaryBriefCard` for preliminary brief presentation.
3. Reuse `JourneyShell` for page frame only; keep validation in domain panel.
4. Do **not** introduce generic JSON form engine or workflow renderer.

## JOS authority

Journey state, transitions, and lifecycle remain server-authoritative via JOS.
