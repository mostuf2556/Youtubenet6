# Active Execution Scratchpad (`temp.md`)

> **Managed Under**: [`docs/operations/TASKS.md`](./docs/operations/TASKS.md)

## Task: TASK-009 — Remove Contradictory Deprecated `.md` & Implement Markdown Link Verification (`npm run test:md`)

### Sub-Tasks Status Lifecycle:
- [done] **Sub-Task 1: Identify and delete contradictory deprecated markdown (`docs/operations/DEPRECATED.md`).**
- [done] **Sub-Task 2: Clean up all references to `DEPRECATED.md` in `mkdocs.yml`, `docs/index.md`, and `PLAN_DOCS_ORGANIZATION.md`.**
- [done] **Sub-Task 3: Implement automated markdown cross-reference validation script `scripts/verify-md-links.ts` and add `npm run test:md`.**
- [done] **Sub-Task 4: Create missing design & operations contracts (`ACTIONS.md`, `DEBUG.md`, `DESIGN_PLAYER_PROVIDER.md`, `DESIGN_STATE_COORDINATOR.md`) to satisfy all contract cross-references.**
- [done] **Sub-Task 5: Update `README.md` documentation links to point to categorized `docs/` subdirectories.**
- [done] **Sub-Task 6: Record ADR-005 in `docs/operations/DECISIONS.md` and update `RECOMMENDATION.md`, `TASKS.md`, `PROMPT_OLD.md`, and `PROMPT.md`.**
- [done] **Sub-Task 7: Run verification suite (`npm run test:md`, `npm run test:caption-formats`, `npm run lint`, `compile_applet`).**
