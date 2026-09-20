# Active Execution Scratchpad (`temp.md`)

> **Managed Under**: [`docs/operations/TASKS.md`](./docs/operations/TASKS.md)

## Task: TASK-010 — Implement JSON3 subtitle contract and native caption alignment rules

### Brief status
- [done] Review and finalize the canonical YouTube `json3` specification for the web and Android hosts.
- [done] Confirm that the project treats `fmt=json3` as the required request format and rejects `.srt`-style assumptions.
- [done] Document direct pairing of source and target caption streams by cue index for native `tlang` translation.
- [done] Capture the per-segment active highlighting flow based on `tStartMs` and `tOffsetMs`.
- [done] Verify the live implementation against the repository validation scripts and update any remaining drift.
- [done] Reset E2E browser state between test runs to eliminate persisted storage contamination.

### Sub-Tasks Status Lifecycle:
- [done] **Sub-Task 1: Tighten the canonical `json3` contract in `docs/specifications/json3.md` with explicit request lifecycle and cue normalization rules.**
- [done] **Sub-Task 2: Document the Android native zero-calculation translation path and preserve the original timedtext request context.**
- [done] **Sub-Task 3: Define the sub-line segment highlighting rules for active cue rendering with offset-based activation.**
- [done] **Sub-Task 4: Run the relevant verification suite (`npm run test:md`, `npm run test:caption-formats`) and confirm no link or fixture regression remains.**
- [done] **Sub-Task 5: Reset Playwright browser storage before each E2E test and verify the suite remains isolated and stable.**

### Notes
- The live implementation must preserve the original timedtext request context; only the target language should change.
- All renderers must consume normalized cue objects, not raw network payloads.
- The active line highlight continues to be driven by `tOffsetMs` and playback time rather than heuristics or text-length approximations.
- Browser storage persists across tests unless the test runner explicitly clears it at the page init boundary; the Playwright reset now clears `localStorage` and `sessionStorage` before each navigation.
- The focused compact-view interaction fixes now pass the full web suite: 20 Playwright tests passed in the web project.
