# Architecture Decision Records (`DECISIONS.md`)

This log records major architectural decisions, technical context, options evaluated, and consequences across the project lifecycle.

---

## ADR-001: Sole Adoption of YouTube JSON3 TimedText Format
- **Date**: 2026-09-19
- **Status**: Accepted
- **Context**: SubRip (`.srt`) lacks fine-grained word/segment timestamp offsets required for sub-line active caption syntax highlighting.
- **Decision**: Deprecate `.srt` format parsing and legacy `.srt` fixture files across the project in favor of standard YouTube `json3`.
- **Consequences**: Enables word-by-word synchronized highlighting (`tStartMs + tOffsetMs`); simplifies parser pipeline to a single unified schema.

---

## ADR-002: Zero-Calculation Native Translation via YouTube `tlang`
- **Date**: 2026-09-19
- **Status**: Accepted
- **Context**: Performing client-side translation or time-alignment on mobile devices causes performance overhead and line mismatch errors.
- **Decision**: On Android, the native WebView interceptor repeats the original `timedtext` API request with the target language code (`tlang=X`), retrieving YouTube's native timedtext stream and pairing translated lines by event sequence index within identical timeframes.
- **Consequences**: Eliminates client-side translation calculations and guarantees zero timing drift across target languages.

---

## ADR-003: Pure View Architecture & Dependency Injection
- **Date**: 2026-09-19
- **Status**: Accepted
- **Context**: UI views coupling data fetching or localStorage logic cannot be test-driven or swapped without breaking dependencies.
- **Decision**: All presentation components MUST be pure views receiving data and state via props/parameters and emitting user intent purely via callbacks.
- **Consequences**: Subtitle views, language selectors, and player controls are completely interchangeable and independently testable via fixture tracks.

---

## ADR-004: Root Markdown Organization & Subdirectory Structure under `docs/`
- **Date**: 2026-09-19
- **Status**: Accepted
- **Context**: An accumulation of loose `.md` files at the project root clutters the repository workspace and complicates documentation navigation and static site generation.
- **Decision**: Enforce root directory hygiene by relocating all project documentation into organized subdirectories under `docs/` (`docs/plans/`, `docs/designs/`, `docs/specifications/`, `docs/operations/`). Only essential top-level files (`AGENTS.md`, `README.md`, and the live runner `temp.md`) remain at root.
- **Consequences**: Streamlines repository structure, integrates cleanly with MkDocs navigation, and prevents root directory sprawl.

---

## ADR-005: Removal of Contradictory Deprecated Markdown & Automated Link Validation
- **Date**: 2026-09-19
- **Status**: Accepted
- **Context**: Legacy documentation files (specifically `docs/operations/DEPRECATED.md`) contained obsolete statements asserting that `.srt` subtitles formed the active speech flow, directly contradicting the canonical JSON3 format mandate in `AGENTS.md` and ADR-001. Additionally, manual link tracking was prone to broken paths following file reorganizations.
- **Decision**: Permanently remove `docs/operations/DEPRECATED.md` and implement automated cross-reference link validation via `scripts/verify-md-links.ts` exposed via `npm run test:md`.
- **Consequences**: Eliminates architectural contradictions from documentation; provides CI-verifiable guarantee that all markdown links resolve correctly.
