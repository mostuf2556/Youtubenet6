# Previous Prompt & Task Archive (PROMPT_OLD.md)

## Archived User Directive 1
> The imported Web Companion was updated to run on Replit with the smallest necessary synchronization and presentation changes.

### Worklist 1
- Triage imported repository and establish baseline build.
- Validate server and client bundle execution.
- Maintain minimal changes necessary for container execution.

---

## Archived User Directive 2
> Ensure all Markdown documentation files (`.md`) are updated to enforce complete architectural modularity, decoupling the design specifications from specific code implementations so the application can be reconstructed or modified across different tools.
> 
> Key deliverables:
> 1. Create `ACTIONS.md` documenting GitHub Actions workflows, execution pipelines, and how they relate to the modular architecture.
> 2. Create `LIBRARY.md` documenting the subtitle fixture library (`test/fixtures/XXX/*.{json,srt}`), supported formats (SRT & JSON3), and fixture-driven web development.
> 3. Update `AGENTS.md` in our own words with the 12 core modularity, architecture, pure-view, fixture, platform separation, and testing requirements.
> 4. Ensure `DESIGN_SUBTITLE_VIEWS.md` and `DESIGN_VIEW_LANGS.md` define stable, tool-agnostic view contracts.
> 5. Update `README.md` to reference the complete documentation suite.
> 6. Provide concrete suggestions for expanding the documentation system to further enhance modularity and tool-agnostic development.

### Worklist 2
- [x] Back up prior directive to `PROMPT_OLD.md`.
- [x] Create comprehensive `ACTIONS.md` explaining GitHub Actions workflows and CI/CD pipelines.
- [x] Create `LIBRARY.md` detailing the fixture library architecture, directory schema, formats, and verification.
- [x] Update `AGENTS.md` with complete implementation-agnostic modularity principles, pure component contracts, and testing boundaries.
- [x] Refine `DESIGN_SUBTITLE_VIEWS.md` and `DESIGN_VIEW_LANGS.md` with explicit data flow and replacement interfaces.
- [x] Update `README.md` to link all primary Markdown guides and explain the modular architecture.
- [x] Verify format verification (`npm run test:caption-formats`), TypeScript compilation (`npm run lint`), and production build (`npm run build`).
- [x] Present documentation enhancements and recommendations to user.

---

## Archived User Directive 3
> Formally integrate the suggested modular design contracts into the documentation ecosystem (`DESIGN_PLAYER_PROVIDER.md`, `DESIGN_STATE_COORDINATOR.md`, `SCHEMA_TIMEDTEXT.md`, and `DESIGN_CONTROLS_VIEW.md`) and prepare the project specifications so that if all view implementations are deleted, the application can be reconstructed purely from the `.md` documentation files without any regression. Also create `DEBUG.md` detailing the diagnostic log viewer, network interception, 15-char response preview, and AI troubleshooting prompt generator.

### Worklist 3
- [x] Create `DESIGN_PLAYER_PROVIDER.md` (Media Playback Contract & Event Stream).
- [x] Create `DESIGN_STATE_COORDINATOR.md` (Abstract Application State Machine).
- [x] Create `SCHEMA_TIMEDTEXT.md` (Timed-Text Schema, Segments, BiDi/RTL Rules).
- [x] Create `DESIGN_CONTROLS_VIEW.md` (Pure Playback Controls Contract).
- [x] Create `DEBUG.md` (Diagnostic Log Viewer, Ring Buffer, Network Interception, 15-char Response Preview, and AI Troubleshooting Prompt Generator).
- [x] Update `AGENTS.md` and `README.md` to incorporate the complete architectural contracts.
- [x] Verify format verification, linter, and build passing.

---

## Archived User Directive 4
> Provide a quick-selection mechanism allowing users to toggle instantaneously between the primary SubRip (.SRT) demo video (`FcRzAdI8R9U` with authentic multi-language tracks in `test/fixtures/FcRzAdI8R9U/*.srt`) and the YouTube JSON3 timed-text demo video (`L2Ryrr6txwA` with authentic 199-segment multi-language tracks in `test/fixtures/L2Ryrr6txwA/*.json`).

### Worklist 4
- [x] Create `test/fixtures/L2Ryrr6txwA/jsonStrings.ts` to import and parse JSON3 tracks (`en`, `he`, `ru`, `it`, `ar`).
- [x] Register `L2Ryrr6txwA` in `test/fixtures/defaultSubtitles.ts` and `src/utils/subtitleCache.ts`.
- [x] Add `L2Ryrr6txwA` entry to `DEFAULT_LIBRARY_ITEMS` in `src/config/appConfig.ts`.
- [x] Add quick format toggle buttons (SRT vs JSON3) to `src/components/DemoQuickFloatingDock.tsx`.
- [x] Add quick demo switcher chips directly into `src/components/LinkInputBar.tsx`.
- [x] Upgrade `src/components/SubtitleArtifactsModal.tsx` to handle both SRT and JSON3 formats with format-specific downloads and raw text tabs.
- [x] Connect `handleSwitchDemoVideo` in `src/App.tsx` for immediate state restoration and toast notifications.
- [x] Verify caption fixture script (`npm run test:caption-formats`) passes 10 fixtures across SRT and JSON3.
- [x] Verify TypeScript type safety (`npm run lint`) passes cleanly with 0 errors.
- [x] Verify production compilation (`compile_applet`) succeeds.

---

## Archived User Directive 5
> "altough tts:on is set - no tts play"
>
> Implementation Scope:
> 1. Diagnose and rectify why Text-to-Speech (TTS) fails to produce audio despite `autoTTSEnabled` / `tts:on` being enabled.
> 2. Fix the Auto-TTS narration loop in `VideoPlayer.tsx`: Ensure cue changes during video playback trigger narration for the displayed target-language text, pausing video during speech and seamlessly resuming playback when speech finishes.
> 3. Fix Web Speech API silent drops and missing-voice detection in `src/lib/ttsEngine.ts`: When system voices do not include the selected language (e.g., Hebrew `he`, Arabic `ar`), immediately cascade to the Neural Audio Stream endpoint (`/api/tts`) rather than silently dropping or using an English voice.
> 4. Ensure robust browser autoplay unlocking in `unlockTTSAudio()` with global interaction listeners on user gestures (`pointerdown`, `touchstart`, `keydown`, `click`).
> 5. Wire settings synchronization (`settings` and `onUpdateSettings`) between `App.tsx` and all `VideoPlayer.tsx` instances to maintain persistent `autoPlayTTS` state.
> 6. Provide immediate audible verification when the user clicks the `TTS: ON/OFF` toggle button.
> 7. Verify all verification scripts (`npm run test:caption-formats`, `npm run lint`, `npm run build`).

### Worklist 5
- [x] Identify root cause in `VideoPlayer.tsx` where Auto-TTS narration effect on `activeCue` change during video playback was missing.
- [x] Implement Auto-TTS playback loop in `VideoPlayer.tsx` with `lastAutoSpokenCueIdRef`, pause-and-resume coordination, and instant audio feedback on `toggleAutoTTS`.
- [x] Add auto-unpause in `playCurrentCueTTS` `finally` block when speech completes.
- [x] Connect `settings` and `onUpdateSettings` to both `<VideoPlayer>` instances in `App.tsx`.
- [x] Add missing voice detection in `WebSpeechEngineAdapter` to immediately fall back to the Neural Audio Stream rather than dropping speech silently for languages without OS voices installed (e.g. `he`, `ar`).
- [x] Improve `AudioStreamFallbackEngineAdapter` with audio unlock retry on `audio.play()` errors.
- [x] Add global pointer/touch/key listeners in `src/lib/ttsEngine.ts` to automatically unlock browser `AudioContext` and `speechSynthesis`.
- [x] Always enable Neural Audio Stream fallback in `speakText` cascade.
- [x] Verify caption fixture test (`npm run test:caption-formats`) passes cleanly with 10 fixtures.
- [x] Verify linter (`npm run lint`) passes with 0 errors.
- [x] Verify production build (`compile_applet`) passes.

---

## Archived User Directive 6 (TASK-008)
> "add to AGENTS.md in your own words: make order with the .md files - moving most of the to docs/"
>
> Implementation Scope:
> 1. Integrated clear guidelines into `AGENTS.md` (both in Section 1 and Section 11) mandating root hygiene and an orderly file structure by organizing markdown files into categorized `docs/` subdirectories (`docs/plans/`, `docs/designs/`, `docs/specifications/`, `docs/operations/`).
> 2. Enforced a strict root whitelist (`AGENTS.md`, `README.md`, `temp.md`) so that no extraneous `.md` files clutter the root directory.
> 3. Created architectural plan `docs/plans/PLAN_DOCS_ORGANIZATION.md` following `docs/plans/PLAN_TEMPLATE.md`.
> 4. Recorded ADR-004 in `docs/operations/DECISIONS.md` establishing markdown documentation layout and directory conventions.
> 5. Updated and synchronized internal markdown cross-references across `AGENTS.md`, `docs/operations/TASKS.md`, and `mkdocs.yml`.
> 6. Verified caption fixture tests (`npm run test:caption-formats`), linter (`npm run lint`), and production build (`compile_applet`).

### Worklist 6
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

---

## Archived User Directive 7 (TASK-009)
> "so do it. and ensure to rm any deprecated .md which says otherwise"
>
> Implementation Scope:
> 1. Audited and removed any deprecated `.md` files that contradicted established architectural contracts in `AGENTS.md` (specifically removed `docs/operations/DEPRECATED.md`).
> 2. Stripped all references to deprecated documentation from `mkdocs.yml`, `docs/index.md`, and `docs/plans/PLAN_DOCS_ORGANIZATION.md`.
> 3. Implemented automated markdown cross-reference validation script `scripts/verify-md-links.ts` and added `npm run test:md` to `package.json`.
> 4. Ensured complete integrity of documentation contract ecosystem (`ACTIONS.md`, `DEBUG.md`, `DESIGN_PLAYER_PROVIDER.md`, `DESIGN_STATE_COORDINATOR.md`).
> 5. Updated relative documentation paths in `README.md` to point to organized `docs/` subdirectories.
> 6. Recorded ADR-005 in `docs/operations/DECISIONS.md` and updated `RECOMMENDATION.md`, `TASKS.md`, `temp.md`, and `PROMPT_OLD.md`.
> 7. Verified all validation checks (`npm run test:md`, `npm run test:caption-formats`, `npm run lint`, `compile_applet`).

### Worklist 7
- [x] Delete `docs/operations/DEPRECATED.md` with conflicting `.srt` assertions.
- [x] Remove `DEPRECATED.md` from `mkdocs.yml`, `docs/index.md`, and `PLAN_DOCS_ORGANIZATION.md`.
- [x] Create automated link validation script `scripts/verify-md-links.ts`.
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




