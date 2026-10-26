# Implementation Guide

This index is not the full contract. Before implementation, read the listed artifacts and inspect the source lines they anchor.

## Current entry points

- `static-page`: read `project-structure.md`, `data-model.md`, `cross_unit_state.yaml`, then `index.html`, `styles.css`, and `app.js`. Preserve learner-visible states and local progress.
- `chat-api`: read `wire_contracts.yaml`, `shared_modules.yaml`, and `units/chat-api/behavior.yaml`. Preserve request limits and distinguish model failure from a valid answer.
- `tutor-api`: read `wire_contracts.yaml`, `shared_modules.yaml`, and `units/tutor-api/behavior.yaml`. Add structured assumptions and verification without requiring private chain-of-thought.
- `practice-api`: read `wire_contracts.yaml`, `shared_modules.yaml`, and `units/practice-api/behavior.yaml`. Reject invalid or semantically inconsistent question sets before scoring.

## Current retrieval boundary

Read `knowledge.js` and `knowledge-base.json` before changing retrieval. Retrieval is deliberately lexical and source-attributed in this increment; do not describe it as embedding or semantic search. Any future embedding adapter must preserve the evidence shape returned by the API and add tests for unsupported questions.

## Global implementation constraints

- `migration_boundary.yaml::must_rewrite` is the implementation scope; source anchors are not a rewrite list.
- Keep the frontend contract backward-compatible during the first increment.
- Use deterministic calculators and validators where possible; do not use a second model call as a pretend verifier.
- Do not claim benchmark improvement until a repeatable benchmark has run.
- Report completion evidence as commands, inputs, outputs, and known limitations.
