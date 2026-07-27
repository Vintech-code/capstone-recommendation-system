# Implementation Roadmap

**Purpose:** Sequence an 18-week plan without scheduling work through unresolved gates.  
**Status:** PROVISIONAL; dates require academic calendar and defense date.  
**Basis:** Roadmap, Section 13, adjusted to make institutional validation Sprint 1.  
**Owner:** Capstone project lead.  
**Last updated:** 2026-07-27.  
**Related IDs:** US-01-US-18, D-001-D-008, R-001-R-013.  
**Open questions:** OQ-001-OQ-012, OQ-014, and calendar/defense dates.

Each sprint is two weeks. Calendar dates are intentionally omitted until approved.

| Sprint | Goal | Exit gate |
|---|---|---|
| 1 | Requirements validation: hosting/database, official course catalogue, board-course/admission rules, score format, authoritative RIASEC instrument/mapping, role assignment details, report/signatories, ML academic scope, privacy/retention, and mobile wrapper method. | Written decisions or explicit blockers recorded. |
| 2 | Conditional foundation: approved architecture/ERD/API/wireframes, environments, CI, authentication skeleton, staging and wrapper feasibility. | D-001-D-003, D-007-D-008, and remaining auth/wrapper details approved. |
| 3 | Combined Admin panel and Admin-controlled official exam workflows with audit/correction history. | Exam ownership/format and privacy controls approved. |
| 4 | Versioned assessment lifecycle and scoring. | Psychometrician-approved instrument/mapping and validation cases. |
| 5 | Course catalogue, effective rules, course profiles, deterministic recommendation engine. | Course/rule/weight decisions approved. |
| 6 | Results explanations, decisions, Admin review, formal reporting. | Output count, wording, report/signatories approved. |
| 7 | System Administrator as the final role-specific panel, followed by authorization, accessibility, performance, imports, operations, and staging integration. | No unresolved critical security/data defects. |
| 8 | UAT, scenario testing, algorithm validation, SUS, defect fixes, manuscript alignment. | Signed conditional/complete acceptance evidence. |
| 9 | Release readiness, restore/rollback rehearsal, production approval, defense evidence and handover. | Launch approval; no critical defects; operating owner accepts handover. |

Later sprints are BLOCKED until their listed decisions are approved. Do not compress validation to preserve a feature schedule. Use the [End-to-End Delivery Checklist](23-END-TO-END-DELIVERY-CHECKLIST.md) for the granular execution order and the [Role-Based Feature Roadmap](24-ROLE-BASED-FEATURE-ROADMAP.md) for screen-by-screen delivery by user role. See [Current Sprint](16-CURRENT-SPRINT.md) and [Product Backlog](15-PRODUCT-BACKLOG.md).

## Current execution note

Development Slice 1: Frontend Foundation began on 2026-07-27 after explicit user approval. This is limited to D-001 foundation work that does not depend on institutional policy. Its automated implementation gates pass, but browser-rendered verification is still PENDING, so the slice remains IN PROGRESS. Public homepage, authentication, dashboards, role workflows, Laravel API, database, recommendation logic, and mobile-wrapper implementation have not started.
