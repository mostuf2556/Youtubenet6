# Best-Practice Markdown Flow Recommendations (`RECOMMENDATION.md`)

This document outlines recommended architectural enhancements and Markdown workflow best practices to complement the existing `AGENTS.md`, `TASKS.md`, and `PLAN_*.md` ecosystem.

---

## 🚀 Recommended Additions to the Markdown Ecosystem

### 1. `DECISIONS.md` — Architecture Decision Records (ADR Log)
- **Purpose**: Record major technical decisions, context, trade-offs, and rationale as immutable records (e.g., ADR-001: Deprecate `.srt` in favor of `json3` segment timing; ADR-002: Android Zero-Calculation Translation via native `tlang`).
- **Value**: Prevents re-debating settled architectural decisions and ensures future agents or contributors understand *why* a specific constraint exists.
- **Structure**:
  ```markdown
  # ADR-001: Sole Adoption of JSON3 TimedText Format
  - **Date**: 2026-09-19
  - **Status**: Accepted
  - **Context**: SubRip (.srt) lacks word/segment timestamp offsets needed for active caption syntax highlighting.
  - **Decision**: Remove .srt parser and mandate YouTube `json3` across all fixture tracks and interceptors.
  - **Consequences**: Fine-grained word highlighting enabled; legacy .srt fixtures removed.
  ```

---

### 2. `CHANGELOG.md` — Release Tag & OTA Version Tracker
- **Purpose**: Maintain a structured version history linking release tags (`vX.Y.Z`) to specific web asset bundles (`web-dist.zip`) and Android APK builds (`YouTube-Viewer-debug.apk`).
- **Value**: Provides complete traceability for the in-app OTA hot-updater (`src/utils/apkUpdater.ts`) and workstation ADB scripts.

---

### 3. `PLAN_TEMPLATE.md` — Standardized Architectural Plan Specification
- **Purpose**: Provide a uniform template for generating new `PLAN_*.md` files.
- **Value**: Ensures every technical plan covers component props, state machine transitions, failure recovery, and test matrices consistently.
- **Structure**:
  ```markdown
  # Plan Title (`PLAN_FEATURE_NAME.md`)
  ## 1. Objective & Scope
  ## 2. Component Hierarchy & Interfaces
  ## 3. Data Flow & State Transitions
  ## 4. Platform Constraints (Web vs. Android)
  ## 5. Automated Test & Verification Matrix
  ```

---

### 4. Cross-Reference Validation Script (`scripts/verify-md-links.ts`)
- **Purpose**: Add a lightweight npm script (`npm run test:md`) to validate internal markdown file links (e.g., ensuring every `PLAN_*.md` referenced in `TASKS.md` actually exists).
- **Value**: Guarantees zero broken references in the documentation graph across automated CI workflows (`web.yml` / `emulation.yml`).

---

### 5. `PROMPT_OLD.md` Auto-Archiving Rule
- **Purpose**: Automatically append completed prompt tasks from `PROMPT.md` to `PROMPT_OLD.md` upon directive completion.
- **Value**: Keeps `PROMPT.md` lightweight and strictly focused on the current active user prompt.

---

## 📊 Summary Matrix of Recommended vs. Adapted Flow

| Markdown File | Role | Status |
| :--- | :--- | :--- |
| `AGENTS.md` | Architectural Foundation & Component Contracts | **[Adapted]** |
| `TASKS.md` | Central Task Priority Index | **[Adapted]** |
| `PLAN_*.md` | Feature Specifications & Dev Execution Flows | **[Adapted]** |
| `temp.md` | Active Sub-Task Execution Scratchpad | **[Adapted]** |
| `DECISIONS.md` | Architectural Decision Records (ADR Log) | **[Adapted]** |
| `CHANGELOG.md` | OTA Asset & Release Tag Tracker | **[Adapted]** |
| `PLAN_TEMPLATE.md` | Uniform Template for Technical Specifications | **[Adapted]** |
| `verify-md-links.ts` | Automated Link Cross-Reference Verification (`npm run test:md`) | **[Adapted]** |
| `PROMPT_OLD.md` | Automatic Directive Archiving Lifecycle | **[Adapted]** |
