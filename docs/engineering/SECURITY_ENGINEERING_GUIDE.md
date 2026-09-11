# Security Engineering Guide

## Authorization matrix

| Role | Scope |
|------|-------|
| ANONYMOUS | Journeys (credential-free), public CMS |
| CUSTOMER_OWNER | Own SRs, own issued quotes |
| OTHER_CUSTOMER | Denied (404/403) |
| PROFESSIONAL_ADMIN | Operations queue, quote draft |
| OWNER_DELEGATE | Quote approve/issue (V1 = admin) |

## Tests required

- Cross-customer IDOR: `test_service_request_customer_privacy.py`
- Ops 403: `test_operations_service_requests.py`, `test_operations_quotes.py`
- Tool policy: `test_tool_policy.py`, `test_ai_prompt_injection.py`

## Rules

- Never log secrets or tokens
- Reject mass-assignment of server-owned fields
- Permission filter before AI context assembly
- CONFIRMATION_MISSING for state-changing AI tools where policy requires

## XSS audit surfaces

AI text, customer RFI, CMS content, Evidence Drawer — use React default escaping; audit rich HTML renders.
