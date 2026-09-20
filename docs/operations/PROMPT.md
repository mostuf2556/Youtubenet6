# Active Prompt & Task Tracking (PROMPT.md)

## Active User Directive
> "add to AGENTS.md in your own words:
> make order with the .md files - moving most of the to docs/"
>
> Implementation Scope:
> 1. Formulate and integrate clear guidelines into `AGENTS.md` (both in Section 1 and Section 11) mandating root hygiene and an orderly file structure by organizing markdown files into categorized `docs/` subdirectories (`docs/plans/`, `docs/designs/`, `docs/specifications/`, `docs/operations/`).
> 2. Enforce a strict root whitelist (`AGENTS.md`, `README.md`, `temp.md`) so that no extraneous `.md` files clutter the root directory.
> 3. Create architectural plan `docs/plans/PLAN_DOCS_ORGANIZATION.md` following `docs/plans/PLAN_TEMPLATE.md`.
> 4. Record ADR-004 in `docs/operations/DECISIONS.md` establishing the markdown documentation layout and directory conventions.
> 5. Update and synchronize all internal markdown cross-references across `AGENTS.md`, `docs/operations/TASKS.md`, and `mkdocs.yml`.
> 6. Verify caption fixture tests (`npm run test:caption-formats`), linter (`npm run lint`), and production build (`compile_applet`).

## Active Worklist
- [x] Integrate "Repository Order & Markdown Relocation Mandate (Root Hygiene)" into `AGENTS.md` Section 1 in our own words.
- [x] Add Subsection 11.7 "Documentation Order & Root Hygiene Mandate" to `AGENTS.md`.
- [x] Relocate loose root `.md` files into corresponding `docs/` subdirectories (`docs/plans/`, `docs/designs/`, `docs/specifications/`, `docs/operations/`).
- [x] Create `docs/plans/PLAN_DOCS_ORGANIZATION.md` following standard template.
- [x] Record ADR-004 in `docs/operations/DECISIONS.md` logging the architectural decision.
- [x] Synchronize relative documentation links across `AGENTS.md`, `docs/operations/TASKS.md`, `docs/index.md`, and `mkdocs.yml`.
- [x] Update active scratchpad `temp.md`.
- [x] Verify caption fixture tests (`npm run test:caption-formats`).
- [x] Run `npm run lint` to confirm type safety.
- [x] Run `compile_applet` to confirm successful build.

