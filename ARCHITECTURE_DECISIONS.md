# Architecture Decisions

## ADR-001: Hidden Conditional Data in Submission

- Status: Accepted
- Decision: Fields hidden by step or field showIf are excluded from submission payload.
- Rationale: Prevents contradictory payloads and keeps downstream decision systems consistent.

## ADR-002: Validation Timing

- Status: Accepted
- Decision: Validate on blur and on step transition.
- Rationale: Keeps feedback timely without over-noisy on-change validation.

## ADR-003: Core-First Build Order

- Status: Accepted
- Decision: Build and verify @formflow/core before React SDK and demo app.
- Rationale: React and demo layers depend on a stable engine contract.

## ADR-004: Branch Strategy

- Status: Accepted
- Decision: Vertical feature branches with PR + squash merge, using descriptive milestone names (for example, `feature/playground-and-embed`) and avoiding day-based names.
- Rationale: Produces recruiter-readable, milestone-oriented history.

## ADR-005: Core Coverage Gate

- Status: Accepted
- Decision: Track statement coverage as the primary numeric gate for core package.
- Rationale: Type-only modules and generated branches can distort branch coverage signals in schema-driven code.
