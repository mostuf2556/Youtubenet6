# Directive Solution Plan (`temp.md`)

## Task: Diagnose and Fix GitHub Pages Deployment & Link Errors

### Sub-Tasks Status Lifecycle:
- [done] **Sub-Task 1: Search codebase and workflows for GitHub Pages deployment scripts and links** - Identified root pathing, repository identity, and missing fallback routes.
- [done] **Sub-Task 2: Identify configuration mismatches (e.g., base path in vite.config.ts vs repository name, deploy-demo.yml workflow setup)** - Fixed `youtubenet3` fallback in `web.yml` `target_url` detection to dynamically resolve `${REPO_NAME}` in `workflow_run` events.
- [done] **Sub-Task 3: Apply targeted fixes to Vite base config, GitHub Pages workflow, and UI links** - Updated `update-readme.mjs` defaults and added auto-generation of fallback `index.html` pages for `demo/` and `playwright/` in `scripts/prepare-report.mjs` to eliminate 404 errors.
- [done] **Sub-Task 4: Local verification (linting, build, test suite)** - Verified `npm run lint`, `prepare-report.mjs`, `compile_applet`.
- [done] **Sub-Task 5: Update `temp.md` and report resolution to user** - Finished.

