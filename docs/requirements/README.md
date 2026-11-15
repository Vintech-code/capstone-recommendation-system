# Product requirements

**Status:** APPROVED repository scope; institutional adoption remains subject to external review.

The TCC Course Recommendation System is a decision-support application for incoming Student Applicants. It records a self-declared entrance examination result, administers a locally stored versioned RIASEC instrument, and presents explainable programme matches. It does not enrol students, guarantee admission, diagnose personality or ability, or make a final course assignment.

## Implemented roles

- **Student Applicant:** owns a personal account, personal and academic profile, entrance declaration, assessment attempts, recommendation history, and saved programmes. The profile requires a unique eight-digit ID number and does not include a separate self-reported Learning Profile & Strengths questionnaire.
- **Administrator:** uses an individual account to monitor students and assessments, govern programme enrichment and media, view aggregate reports, review audit activity, and—when explicitly authorized—manage Administrator invitations and account access.

No role-selection form, shared Administrator credentials, counselor portal, or separate native feature implementation is in scope.

## Authoritative boundaries

- Laravel owns authentication, authorization, validation, scoring, admission-group classification, recommendation generation, persistence, and audit records.
- Administrator accounts are provisioned through expiring single-use invitations. Only Administrators with the account-management capability may invite, suspend, reactivate, change that capability, or revoke sessions, and every sensitive action requires password confirmation and an audit event.
- Every user-created password uses one Laravel-authoritative policy: 12 to 255 characters with uppercase and lowercase letters, a number, and a symbol. Registration, Administrator invitation acceptance, recovery, authenticated password change, and the local Administrator creation command apply the same rule.
- Student registration stores `first_name` and `last_name` separately and constructs display names from those fields. Local email registration requires strict server-side syntax/domain validation and signed-link ownership verification; unverified accounts cannot sign in or access protected APIs. Verification resend responses do not reveal whether an account exists. Google sign-in remains an ownership-verifying alternative only when Google reports the email as verified.
- React presents server-owned state and does not invent thresholds, mappings, policy, or results.
- Assessment answer selection may auto-advance by one question only. Rapid taps must not stack navigation transitions. Any unanswered question behind the current position must be identified by number and directly reachable, and final submission must remain unavailable until all stored instrument questions have explicit responses.
- Completed assessments and recommendation snapshots are immutable. Corrections and retakes create auditable history.
- `SELF-DECLARED-TCC-ENTRANCE-2026-01` records 1.0–2.5 as the board-programme guidance group and 2.6–5.0 as the non-board group. The group does not filter the all-programme RIASEC ranking.
- The current 42-item binary instrument is `tcc-uhcc-riasec-42-v1`; each RIASEC area has seven stored questions.
- The PSG-informed three-code programme matrix remains **PROPOSED**. Catalogue version 4 exposes 12 classified programme-major entries across 11 distinct ordered profiles, including separately ranked BSEd English `SAI`, Filipino `SAI`, and Social Studies / Araling Panlipunan `SIE`. BS Community Development remains visible but unranked while its authoritative basis is pending.
- New recommendation runs use researcher-proposed ordered programme-profile weights of 50% primary, 30% secondary, and 20% tertiary under `PROPOSED-RIASEC-4-ORDERED-WEIGHTS`. This deterministic formula remains pending external review. Equal Student RIASEC scores are presented as shared competition ranks instead of being described as a strict first/second/third order.
- Result presentation model `PSG-PROFILE-NAMES-2026-09-21-V2` preserves the 11 repository-owner-approved, PSG-matrix-controlled two-word interest-profile names and exact two-sentence descriptions, then derives unique presentation copy for the other 109 valid ordered Student result codes. These 120 labels are friendly summaries of vocational interests rather than personality diagnoses, do not classify additional programmes, and do not affect scoring or recommendation ranking.
- CMO-grounded programme facts are source-controlled. Administrators may manage reviewed ESCO mappings and programme media through the ordinary editor. SHS school, strand/track, graduation-year, recommended-strand, and strand-guidance fields are outside the active Student and Administrator scope.

See dated records under `docs/note/` for approval history and validation evidence.
