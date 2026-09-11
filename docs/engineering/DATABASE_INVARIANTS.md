# EAM Database Invariants Map

| Invariant | Application guard | DB guard | Test |
|-----------|-------------------|----------|------|
| One SR per journey instance | `ServiceRequestService.create_from_journey` checks existing | `UNIQUE(journey_instance_id)` | `test_service_requests.py` |
| Unique SR reference codes | Generator + retry | `UNIQUE(reference_code)` | concurrent creation test |
| SR status transitions | `ALLOWED_TRANSITIONS` in service | status column (no enum DB) | `test_service_request_transitions.py` |
| Snapshot immutability | No update path on `intake_snapshot` | JSON column write-once | journey completion tests |
| Customer isolation | `get_by_id_for_user` | user_id filter | `test_service_request_customer_privacy.py` |
| One active quote per SR | `QuoteService.create_draft` | `UNIQUE(service_request_id)` on quotes | `test_quotes.py` |
| JOS instance ownership | session/user binding in JOS | FK journey_instances | `test_jos_identity_continuity.py` |

**Note:** Quote table requires migration `t0u1v2w3x4y5` applied.
