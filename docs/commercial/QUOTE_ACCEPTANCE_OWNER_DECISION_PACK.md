# Quote Acceptance — Owner Decision Pack

**Purpose:** Group unresolved acceptance questions for product owner review.  
**Canonical matrix:** `docs/commercial/QUOTE_ACCEPTANCE_DECISION_RECORD.md` (do not duplicate status there).  
**Engineering:** Blocked until Business Lab adds APPROVED rows to `docs/business-lab-decisions.md`.

---

## Group A — Meaning of Acceptance

| Question | Why it matters | Options | Engineering impact | Commercial impact | Dependencies |
|----------|----------------|---------|-------------------|-------------------|--------------|
| Is acceptance **binding** or **intent to proceed**? | Defines legal/commercial commitment and downstream Contract trigger | **A1** Binding commercial acceptance · **A2** Non-binding intent · **A3** Hybrid (intent now, binding after Contract) | State machine labels, confirmation UX copy, audit severity | Sales pipeline, dispute handling | Groups B, F |
| What event means **commercial commitment exists**? | Unblocks Contract / OperationalProject JIT | **F1** Customer acceptance · **F2** Contract signature · **F3** Payment/deposit | Which BO transitions fire | Revenue recognition policy | Group F |

**Recommendation type:** BUSINESS_DECISION_REQUIRED · LEGAL_REVIEW_RECOMMENDED for binding options.

**What remains blocked:** Acceptance API, customer Accept button, Contract BO, OperationalProject BO.

---

## Group B — Who Can Accept

| Question | Why it matters | Options | Engineering impact |
|----------|----------------|---------|-------------------|
| Who may accept an issued Quote? | Authorization matrix | **B1** Customer owner only · **B2** Owner + delegated contact (future) · **B3** Professional accepts on behalf (not recommended without policy) | `get_current_user` + SR ownership checks |
| Can anonymous users accept? | Security | **No** (engineering default guard only — owner must confirm) | 401 for anonymous |

**Recommendation:** ENGINEERING_RECOMMENDATION — **B1** (customer owner of linked SR) aligns with existing IDOR model.

**Owner choice:** Not recorded — awaiting decision.

---

## Group C — Versioning & Revision

| Question | Why it matters | Options | Engineering impact |
|----------|----------------|---------|-------------------|
| Can an **issued** Quote be revised? | Immutability vs amendment | **C1** No — new Quote revision row · **C2** Yes — supersede with version bump · **C3** Draft-only edits until issue (current M1) | Schema version column, customer history UX |
| What happens to old versions? | Audit trail | **C1** Read-only archive · **C2** Hidden from customer | Snapshot/history endpoints |

**Recommendation:** ENGINEERING_RECOMMENDATION — **C1/C1** (immutable issued + new revision) matches M1 quote immutability direction.

**Owner choice:** Not recorded.

---

## Group D — Expiry / Withdrawal / Rejection

| Question | Why it matters | Options | Engineering impact |
|----------|----------------|---------|-------------------|
| Enforce 30-day validity on acceptance? | M1 stores `valid_until` but no enforcement | **D1** Hard block after expiry · **D2** Owner may extend · **D3** Informational only | Transition guards, cron optional |
| Can Quote be **withdrawn** after issue? | Customer confusion vs ops control | **W1** Owner/professional withdraw · **W2** Not allowed | New status `withdrawn` |
| Can customer **reject** explicitly? | Pipeline hygiene | **R1** Reject with reason · **R2** No formal reject (ignore) | Status `rejected`, SR reopen rules |

**Recommendation:** BUSINESS_DECISION_REQUIRED for D1/D2; ENGINEERING_RECOMMENDATION for R1 if rejection is allowed.

**Owner choice:** Not recorded.

---

## Group E — VAT / Currency / Discount

| Status | Notes |
|--------|-------|
| **DECIDED (M1)** | SAR only, 15% VAT exclusive, OWNER-only discount |

No owner action required unless policy changes.

---

## Group F — Downstream Triggers

| Question | Why it matters | Options | What remains blocked |
|----------|----------------|---------|---------------------|
| What triggers **Contract** BO? | JIT creation | **F2** After acceptance · **F4** Separate manual step · **F5** Not required for M2 | Contract implementation |
| What triggers **OperationalProject**? | Execution ownership | **P1** After accepted Quote · **P2** After Contract · **P3** After payment | OpProject journey #16 |
| What triggers **Payment**? | No fake checkout | Provider, invoice, refund policy required | Payment BO |

**Recommendation:** BUSINESS_DECISION_REQUIRED — do not assume acceptance auto-creates Contract.

---

## Group G — Audit / Evidence / Confirmation

| Requirement | Engineering note |
|-------------|------------------|
| Actor, timestamp, old/new state, trace_id | Extend quote service audit (fields or event log) |
| Customer confirmation step | Modal + explicit Arabic legal copy (owner-provided) |
| Professional visibility | Professional Review commercial tab |

**Recommendation:** ENGINEERING_RECOMMENDATION — implement when Groups A–D approved.

---

## Summary for owner meeting

Answer **Group A first** (binding vs intent), then **Group B** (who accepts), then **Group D** (expiry/reject/withdraw), then **Group C** (revision), then **Group F** (downstream triggers).

Until then: **QUOTE_ACCEPTANCE=BLOCKED_BUSINESS_DECISION** — no engineering implementation.
