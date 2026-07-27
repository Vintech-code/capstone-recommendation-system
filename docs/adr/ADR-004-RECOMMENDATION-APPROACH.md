# ADR-004: Deterministic Recommendation Baseline

**Purpose:** Choose a defensible recommendation approach while ML evidence is absent.  
**Status:** PROPOSED; domain configuration BLOCKED.  
**Basis:** Proposal requires course recommendations and names ML; roadmap identifies missing labels/dataset and recommends explainable rules first.  
**Owner:** Adviser and Psychometrician approve validity; capstone technical lead implements.  
**Last updated:** 2026-07-26.  
**Related IDs:** D-004, D-006, BR-04-BR-12, R-001-R-006.  
**Open questions:** OQ-002-OQ-005, OQ-009, OQ-011.

## Decision

The MVP must include a deterministic, versioned, explainable RIASEC plus admission-rule baseline. Every recommendation stores its verified inputs, governing questionnaire/scoring/course-rule/profile/algorithm versions, component scores, eligibility result, ranking, and explanation.

Decision Tree and Random Forest are optional enhancements only after the ML gate in [Recommendation Engine](../09-RECOMMENDATION-ENGINE.md) is approved. ML cannot bypass mandatory eligibility rules.

## Rationale

No approved target label, labelled dataset, sample size, split, metrics, fairness evaluation, or model card exists. A rules baseline is reproducible and can be validated directly with institutional experts.

## Consequences

- The system can be built and defended without unsupported accuracy claims.
- The provisional 70/30 formula, normalization, tie-breaks, course profiles, and displayed count remain configurable and cannot be hardcoded as policy.
- If ML is mandatory academically, the team must obtain lawful approved data or formally revise the manuscript objective.

## Alternatives

- ML-only recommender: rejected until evidence exists.
- Interest-only matching: rejected because official admission rules are a core input.
- Admission-only filtering: rejected because it omits the RIASEC purpose.

Related: [Business Rules](../06-BUSINESS-RULES.md), [Testing Strategy](../13-TESTING-STRATEGY.md).

