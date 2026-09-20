# Active Prompt & Task Tracking (PROMPT.md)

## Active User Directive (TASK-011)
> Extend Android Emulator E2E Report with 20-Line Subtitle Proof, Request/Response Wire Telemetry, and Interactive User Simulation
>
> Implementation Scope:
> 1. Extend the Android emulator E2E test report (`cypress/reports/android-emulator-report.html` and root `android-emulator-report.html`) to demonstrate subtitle fetching proof across 20 lines with timecodes for Default (English `en`), Spanish (`tlang=es`), Hebrew (`tlang=he`, RTL), Italian (`tlang=it`), Arabic (`tlang=ar`, RTL), and Russian (`tlang=ru`).
> 2. Implement full HTTP request and response wire telemetry inspection showing real request parameters, headers, response status codes, gzip encoding, 15-character hex previews, and Base64 `evaluateJavascript` bridge dispatches.
> 3. Provide an interactive Pixel 7 device simulator with step-by-step user interaction flow, real-time dual subtitle playback with sub-line word segment highlighting (`segs[]`), and TTS loop demonstrations.
> 4. Verify report generation script (`node scripts/prepare-report.mjs`), test suites (`npm run test:md`, `npm run test:caption-formats`, `npm run test:ota`), and zero-error builds (`npm run lint`, `compile_applet`).

## Active Worklist
- [x] Sub-Task 1: Subtitle Fetching Proof (20 lines across default and target translated tracks).
- [x] Sub-Task 2: HTTP Request/Response Wire Telemetry Inspector with 15-char previews.
- [x] Sub-Task 3: Interactive Pixel 7 Device Screen & User Simulation.
- [x] Sub-Task 4: Build, Compilation, & Report Artifacts Verification.
- [x] Verify markdown links (`npm run test:md`), fixture formats (`npm run test:caption-formats`), and OTA updater (`npm run test:ota`).
- [x] Run `npm run lint` (0 TypeScript errors).
- [x] Run `compile_applet` (production build verified).
