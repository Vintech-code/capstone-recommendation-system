# Source of Truth

**Purpose:** Define evidence precedence, document statuses, and conflict handling.  
**Status:** APPROVED for project governance.  
**Basis:** Documentation initialization brief.  
**Owner:** Capstone team documentation lead.  
**Last updated:** 2026-07-27.  
**Related IDs:** D-001-D-008.  
**Open questions:** Approval authorities and signatories remain in OQ-008 and OQ-010.

## Source precedence

When sources conflict, use this order:

1. Written and signed client, adviser, or psychometrician decisions.
2. APPROVED entries in [18-DECISION-REGISTER.md](18-DECISION-REGISTER.md).
3. [Original capstone proposal](reference/FINAL-Papers-2.pdf) for academic purpose, objectives, scope, beneficiaries, and research methodology.
4. [React system roadmap](reference/React_Capstone_System_Roadmap.pdf) for technical planning and implementation.
5. New engineering recommendations, explicitly labelled PROPOSED and recorded in an ADR.

No conflict may be resolved silently. Record the conflict, its impact, and the required approver.

## Status vocabulary

| Status | Meaning |
|---|---|
| APPROVED | Accepted by the authorized decision-maker with evidence. |
| PROPOSED | Recommended but not yet approved. |
| PROVISIONAL | Working baseline expected to change after validation. |
| BLOCKED | Cannot safely proceed until a named decision or dependency is resolved. |
| IN PROGRESS | Started with current evidence. |
| COMPLETED | Finished with linked test, review, or approval evidence. |
| DEFERRED | Intentionally postponed. |
| OUT OF SCOPE | Excluded from the current approved delivery boundary. |

## Known source conflicts

| Topic | Proposal | Roadmap/engineering interpretation | Controlled status |
|---|---|---|---|
| Database | Development text uses MySQL/phpMyAdmin; architecture uses PostgreSQL. | Roadmap prefers PostgreSQL; hosting baseline recommends MySQL 8 for ordinary Hostinger shared/cloud. | BLOCKED: D-003/OQ-001. |
| Frontend | HTML/CSS/JavaScript/Bootstrap and Laravel. | React/Vite/TypeScript presentation layer using Tailwind CSS v4, shadcn/ui with Radix, and Lucide; Laravel remains the REST API. | APPROVED for frontend: D-001/ADR-001. Laravel remains PROPOSED under D-002/ADR-002. |
| Platform | Architecture text mentions web or mobile. | One responsive web codebase is authoritative and will be delivered in a non-native mobile wrapper; no separate native feature codebase. | APPROVED: D-001/D-008 and ADR-005; wrapper method BLOCKED by OQ-014. |
| Exam ownership | Architecture says students input admission scores. | Official values are controlled by authorized Guidance/Psychometrician/Admin users; students have read-only access. | Role holder APPROVED by D-007; detailed workflow remains PROPOSED under D-005/OQ-002. |
| Roles | Sources describe several offices/personas. | The interview-derived implemented model has exactly three application roles. | APPROVED: D-007. |
| Recommendation | Proposal states ML is used. | Dataset, labels, metrics, and validation evidence are undefined. | Deterministic baseline PROPOSED; ML BLOCKED. |
| RIASEC instrument | Appendix contains a 42-item worksheet and separate 18-item Career Assessment. | Roadmap retains 42 items provisionally. | BLOCKED pending psychometrician decision. |
| Delivery state | Proposal narrates testing, deployment, review, and launch in past tense. | Repository has no evidence of those activities. | NOT COMPLETED. |

Related documents: [Decision Register](18-DECISION-REGISTER.md), [Open Questions](22-OPEN-QUESTIONS.md), [ADRs](adr/).
