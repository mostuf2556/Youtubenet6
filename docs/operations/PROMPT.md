# Active Prompt & Task Tracking (PROMPT.md)

## Active User Directive
> "so do it. and ensure to rm any deprecated .md which says otherwise"
>
> Implementation Scope:
> 1. Audit and remove any deprecated `.md` files that contradict the established architectural contracts in `AGENTS.md` (specifically removing `docs/operations/DEPRECATED.md`, which asserted that `.srt` was the primary speech flow contrary to canonical `json3` mandates and ADR-001).
> 2. Strip all references to deprecated documentation from `mkdocs.yml`, `docs/index.md`, and `docs/plans/PLAN_DOCS_ORGANIZATION.md`.
> 3. Implement the recommended automated markdown cross-reference validation script `scripts/verify-md-links.ts` and add `npm run test:md` to `package.json`.
> 4. Ensure complete integrity of the documentation contract ecosystem by providing required contracts (`ACTIONS.md`, `DEBUG.md`, `DESIGN_PLAYER_PROVIDER.md`, `DESIGN_STATE_COORDINATOR.md`) referenced in `AGENTS.md` and `README.md`.
> 5. Update relative documentation paths in `README.md` to point to organized `docs/` subdirectories.
> 6. Record ADR-005 in `docs/operations/DECISIONS.md` and update `RECOMMENDATION.md`, `TASKS.md`, `temp.md`, and `PROMPT_OLD.md`.
> 7. Verify all validation checks (`npm run test:md`, `npm run test:caption-formats`, `npm run lint`, `compile_applet`).

## Active Worklist
- [x] Delete `docs/operations/DEPRECATED.md` with conflicting `.srt` assertions.
- [x] Remove `DEPRECATED.md` from `mkdocs.yml`, `docs/index.md`, and `PLAN_DOCS_ORGANIZATION.md`.
- [x] Create automated link validation script `scripts/verify-md-links.ts` with code-span stripping and wildcard ignoring.
- [x] Add `"test:md": "tsx scripts/verify-md-links.ts"` script to `package.json`.
- [x] Create `docs/operations/ACTIONS.md`, `docs/operations/DEBUG.md`, `docs/designs/DESIGN_PLAYER_PROVIDER.md`, and `docs/designs/DESIGN_STATE_COORDINATOR.md`.
- [x] Update `README.md` links to point to categorized `docs/` directories.
- [x] Record ADR-005 in `docs/operations/DECISIONS.md`.
- [x] Update `docs/operations/RECOMMENDATION.md` and `docs/operations/TASKS.md`.
- [x] Update active runner `temp.md` and archive prior directive in `docs/operations/PROMPT_OLD.md`.
- [x] Run `npm run test:md` (26 markdown files, 43 relative links verified).
- [x] Run `npm run test:caption-formats` (all 10 fixtures verified).
- [x] Run `npm run lint` (0 TypeScript errors).
- [x] Run `compile_applet` (production build verified).


