# AGENTS.md — Modular Project & Agent Guidelines

## 1. Project Purpose & Documentation Hierarchy

This repository implements a modular subtitle-learning platform designed to run across two hosts:
- **Browser Companion**: A fixture-driven web environment for testing, UI validation, and demonstration without relying on live YouTube caption interception.
- **Android Native Host**: A native container (`android-shell/`) capable of inspecting WebView network traffic to capture live YouTube caption requests and leverage hardware capabilities.

The project is governed strictly by Markdown design specifications rather than specific code implementations. By following these documents, the entire application or any of its views can be completely re-created, replaced, or updated using different tools and frameworks while preserving identical behavior.

### Required Documentation Ecosystem
- **`AGENTS.md`**: Architectural foundation, modularity mandates, component contracts, platform boundaries, and testing roadmap.
- **`docs/operations/TASKS.md`**: Central task index and priority tracker referencing detailed `PLAN_*.md` files.
- **`docs/plans/PLAN_*.md`**: Specialized architectural plans, technical specifications, and dev execution flows (e.g. `PLAN_ANDROID_UPDATES.md`, `PLAN_DOCS_ORGANIZATION.md`).
- **`docs/operations/DECISIONS.md`**: Immutable Architecture Decision Records (ADR log) recording contextual rationale and settled constraints.
- **`docs/operations/CHANGELOG.md`**: Structured release tag and OTA asset bundle (`web-dist.zip` / APK) deployment history.
- **`docs/operations/RECOMMENDATION.md`**: Active backlog of recommended workflow, architectural, and developer tooling enhancements.
- **`docs/plans/PLAN_TEMPLATE.md`**: Standardized specification template for creating new `PLAN_*.md` files.
- **`docs/operations/PROMPT.md`**: Active user requirements and task tracker, rewritten in the agent's own words for every directive.
- **`docs/operations/PROMPT_OLD.md`**: Historical archive of previous directives and completed task lists.
- **`docs/specifications/LIBRARY.md`**: Specification and structure of the subtitle fixture library (`test/fixtures/`).
- **`docs/specifications/json3.md`**: Specification for YouTube JSON3 timedtext format, network interception, and zero-calculation native translation alignment.
- **`docs/designs/DESIGN_SUBTITLE_VIEWS.md`**: Structural interface and behavior contract for all subtitle-rendering views.
- **`docs/designs/DESIGN_VIEW_LANGS.md`**: Structural interface and behavior contract for all language-selection views.
- **`docs/designs/DESIGN_CONTROLS_VIEW.md`**: Structural interface and behavior contract for playback control views.
- **`docs/designs/DESIGN_PLAYER_PROVIDER.md`**: Vendor-agnostic media playback provider and time synchronization contract.
- **`docs/designs/DESIGN_STATE_COORDINATOR.md`**: Finite state machine, transitions, active cue resolution, and state flow.
- **`docs/specifications/SCHEMA_TIMEDTEXT.md`**: Format definitions, segment timings, entity decoding, and RTL/BiDi normalization.
- **`docs/operations/DEBUG.md`**: Diagnostic log viewer, network request interception, 15-char response preview, and AI troubleshooting prompt generator.
- **`docs/operations/ACTIONS.md`**: Automated GitHub Actions CI/CD workflows and deployment pipelines.

### Repository Order & Markdown Relocation Mandate (Root Hygiene)
To maintain an orderly, professional, and uncluttered repository workspace, all markdown documentation must be systematically moved and organized into specialized subdirectories under `docs/`:
- **`docs/plans/`**: Comprehensive feature blueprints, roadmaps, and dev execution plans (`PLAN_*.md`).
- **`docs/designs/`**: Pure UI view specifications, contracts, and component interface designs (`DESIGN_*.md`).
- **`docs/specifications/`**: Format standards, timedtext schemas, and test fixture specifications (`json3.md`, `SCHEMA_TIMEDTEXT.md`, `LIBRARY.md`).
- **`docs/operations/`**: Operational tracking, task priority queues, ADRs, release changelogs, test coverage, and troubleshooting guides (`TASKS.md`, `PROMPT.md`, `DECISIONS.md`, `CHANGELOG.md`, `RECOMMENDATION.md`, `COVERAGE.md`, `DEBUG.md`, `ACTIONS.md`).
- **Strict Root Whitelist**: Only core operational entry points remain in the project root: `AGENTS.md` (AI Studio instructions & architectural guidelines), `README.md` (project overview), and `temp.md` (active execution runner managed under `TASKS.md`). All other documentation files must be placed inside their respective `docs/` subdirectories.

---

## 2. Modularity and Pure View Architecture

The primary architectural goal is **complete modularity through pure components**:

```text
[External Provider / Network / Cache]
                  │
                  ▼ (Fetches & Normalizes)
          [Normalized Data]
                  │
                  ▼ (Injected via Props)
         [Pure View Component]
                  │
                  ├──► Renders UI Presentation
                  └──► Emits User Intent Callbacks (e.g., onSelect)
```

### Pure Component Mandates
1. **Separation of Concerns**: Data acquisition, network traffic, cache persistence, and format parsing belong strictly outside presentation views.
2. **Dependency Injection**: Views receive all necessary state and data via props or parameters.
3. **No Hidden Logic**: A view must never initiate network requests, read the filesystem, access localStorage, parse raw SRT/JSON3 files, or perform translations on its own.
4. **Interchangeability**: Any view implementation (e.g., overlay, transcript list, compact card, bottom sheet) must be completely swappable with another visual implementation as long as both consume the same defined interface.
5. **Pure Event Dispatch**: Views report user interactions solely through callback functions (e.g., `onSelectCue`, `onSelectLanguage`). The view does not decide how playback or state responds to that event.

---

## 3. Subtitle Rendering Pipeline

The application is fundamentally a subtitle-rendering and language-learning tool. Subtitle renderers must never fetch subtitles directly:

```text
Subtitle Provider ──► Subtitle Data ──► Subtitle Renderer ──► UI Display
```

- **Subtitle Provider**: Loads local fixtures (web) or intercepts network requests (Android), parses them, and yields normalized cues.
- **Subtitle Renderer**: Defined in `docs/designs/DESIGN_SUBTITLE_VIEWS.md`. It accepts `SubtitleCue[]`, an active cue identifier, optional translations, and interaction callbacks.
- **Independence**: This separation enables isolated unit and visual regression testing of any renderer using synthetic or fixture subtitle cues.

---

## 4. Language Selection Pipeline

Language-selection controls must strictly decouple language data management from visual display:

```text
Language Provider ──► Language Options Data ──► Language View ──► User Action
```

- **Contract**: Defined in `docs/designs/DESIGN_VIEW_LANGS.md`.
- **Injected Data**: A normalized array of language objects (`code`, `name`, optional `nativeName`, `direction`, `enabled`).
- **View Responsibility**: Renders the options and triggers an `onSelect(code)` callback upon user selection.
- **Agnostic**: Multiple views (drop-downs, floating pills, settings modals, sidebar lists) can consume the identical language list without requiring separate data stores.

---

## 5. Canonical Subtitle Format (`json3`) & Segment Syntax Highlighting

The application exclusively supports YouTube's structured **`json3`** timedtext format (`.json`):

1. **Deprecation of `.srt`**: SubRip Text (`.srt`) support and legacy `.srt` files are completely removed in favor of standard YouTube `json3`.
2. **Sub-Line Segment Syntax Highlighting**: Subtitle renderers MUST render the complete subtitle line section while dynamically applying active syntax highlighting to individual word/phrase segments (`segs[]`) based on their fine-grained JSON3 time-frame offsets (`tStartMs` + `tOffsetMs`). As playback advances through the line's duration, the active word segment is highlighted in real time.

---

## 6. Platform Responsibilities: Web Companion vs. Android Host

The browser companion and Android native host solve different constraints:

### Web Companion
- Operates inside standard web browsers and CI/CD pipelines.
- Standard browsers cannot inspect cross-origin HTTPS requests inside a YouTube `<iframe>`.
- **Web Solution Purpose**: The web companion application is strictly for testing the application flow, UI validation, and demonstration — it is NOT intended for other general use.
- **Fixture Artifacts**: Uses local static fixture artifacts for 2 example video IDs (`test/fixtures/L2Ryrr6txwA/` and `test/fixtures/FcRzAdI8R9U/`) to supply offline subtitle tracks across multiple languages for testing.
- Serves as the primary presentation and automated verification driver to test-drive application flows.

### Android Native Host
- Operates inside an Android WebView (`android-shell/`).
- Intercepts network operations when the user toggles captions, detecting requests to:
  `https://www.youtube.com/api/timedtext`
- **Android Solution (`tlang` Parameter)**: To retrieve subtitles in target language X, the native interceptor modifies the observed `timedtext` request parameters by replacing or appending `tlang=X` (preserving `fmt=json3`), and replays the request with the original headers and context.
- **Zero-Calculation Native Translation**: Yields authentic server-side translated caption streams from YouTube with 1:1 timeline alignment.
- **Critical Requirement**: Must preserve the complete original request context (headers, cookies, query parameters, formatting) rather than constructing an arbitrary URL.
- **Failure Visibility in Tests**: In case the native solution using `tlang` value change is not working or returns an error, it MUST be immediately visible and fail in automated tests (Android E2E tests, CI network interceptor tests, and report integrity verification).
- **Mocked Testing vs. Real-World Production Execution**:
  - Default videos and static subtitle fixture artifacts (`test/fixtures/`) MAY be used on Android strictly during mocked test-driving scenarios to validate UI flows when offline or isolated.
  - **Separated Real-World Test Scenario Requirement**: A separate, unmocked test scenario MUST be maintained to verify real-world live caption fetching without mock data or static fixtures.
  - **Native `tlang` Parameter Verification**: The unmocked test scenario MUST assert that the application successfully retrieves target-language subtitles directly from YouTube by replacing or appending the `tlang` parameter on the native `timedtext` request, relying entirely on YouTube's native timedtext stream without performing client-side translation calculations.

---

## 7. Deprecation of Translation Services (Google Translate & On-Demand Translation)

1. **Strict Inaccuracy Deprecation**: Using any external translation service (e.g. Google Translate, Google GTX public API endpoints, or third-party translation APIs) to translate subtitle records is NOT accurate enough and is therefore **completely deprecated and forbidden**. Do not use it at all!
2. **Removal of On-Demand Translation**: All on-demand subtitle translation mechanisms (e.g. translating arbitrary subtitle records or batches on the fly) are removed / commented out.
3. **Canonical Subtitle Sources**:
   - **Android Native Host**: Only authentic YouTube `timedtext` streams retrieved via native `tlang` parameter swaps.
   - **Web Companion**: Deterministic local fixture artifacts for the 2 example video IDs used for flow validation.
4. **Test Failure Visibility**: If native `tlang` translation fetching fails, the system must not silently fall back to machine translation services. The failure must surface directly in automated test suites and diagnostic logs.

---

## 8. Subtitle Fixture Library Architecture

The fixture library is a first-class feature of the project, documented in `docs/specifications/LIBRARY.md`.

- **Root Location**: `test/fixtures/`
- **Schema**: `test/fixtures/<VIDEO_ID>/*.json` where `<VIDEO_ID>` is the 11-character YouTube video ID.
- **Reference Tracks**: `test/fixtures/L2Ryrr6txwA/*.json` (JSON3 fixtures: `en`, `ru`, `he`, `it`, `ar`).
- **Format Verification**: Validated via `npm run test:caption-formats`.
- **Fixture Usage & Isolation**: Subtitle fixtures serve primarily to test-drive UI views, rendering pipelines, and state coordinator transitions on the Web Companion platform. They MAY also be used to test-drive Android UI flows in isolated mocked scenarios, but MUST NOT replace real-world unmocked `timedtext` API interception tests.

---

## 9. Deferred Android E2E Tests

These tests represent native Android capabilities and are intentionally documented for later implementation:

- **Android E2E Test 2.1**:
  - Enable the native caption icon in the Android WebView.
  - Automatically detect the outgoing `timedtext` network operation in the native interceptor.
- **Android E2E Test 2.2**:
  - Detect the initial `timedtext` request.
  - Modify the `tlang` parameter to a target language code while preserving all other request attributes (headers, credentials, format).
  - Execute the modified request and assert a successful timed-text response in the target language.

> **Implementation Phase Notice**: Do not implement these Android tests during the current web implementation phase. They are scheduled for a later stage utilizing GitHub Actions Android emulators.

---

## 10. Current Implementation & Testing Phase

The active implementation phase mandates:
1. Strict adherence to Markdown design contracts (`docs/designs/DESIGN_SUBTITLE_VIEWS.md`, `docs/designs/DESIGN_VIEW_LANGS.md`, `docs/designs/DESIGN_CONTROLS_VIEW.md`, `docs/designs/DESIGN_PLAYER_PROVIDER.md`, `docs/designs/DESIGN_STATE_COORDINATOR.md`, `docs/specifications/SCHEMA_TIMEDTEXT.md`, `docs/specifications/json3.md`).
2. Complete view reconstruction capability: If any or all presentation views are deleted, they can be reconstructed from scratch purely using these Markdown contracts.
3. Web companion operation driven by local fixture providers from `docs/specifications/LIBRARY.md`.
4. Automated testing scoped to web E2E tests only (Playwright and Cypress).
5. **Test Failure Diagnostics**: Whenever requested to diagnose or fix test failures, analyze the latest workflow run failures directly from the primary CI pipelines:
   - Web E2E Pipeline Logs: https://github.com/mostuf2556/Youtubenet6/actions/workflows/web.yml
   - Android Emulation Pipeline Logs: https://github.com/mostuf2556/Youtubenet6/actions/workflows/emulation.yml
6. Code verification via standard scripts:
   ```bash
   npm run test:caption-formats   # Validates JSON3 fixture parsing
   npm run test:ota               # Validates OTA release artifact updater pipeline
   npm run lint                   # Validates TypeScript type safety
   npm run build                  # Validates production bundles
   ```

---

## 11. Application Core & Layout Directives

1. **Default Compact UI Density**: Use a compact design density by default across both Web and Android native host platforms to maximize viewable screen real estate for media player presentation and subtitle rendering.
2. **In-App & Hardware History Navigation**: Enable seamless in-app navigation supporting browser and Android device back/forward system buttons via standardized HTML5 history state management.
3. **Home Screen (Library View)**: The default landing view of the application is a Library View where users can browse, manage, and load previously saved learning projects.
4. **Direct Link Creation Bypass**: When creating a new project via an incoming shared link or URL parameter (e.g. `?v=<ID>` or native intent share), bypass the Library View on first launch and enter the video player directly.
5. **Background Execution Roadmap**: Future iterations will incorporate background service execution to maintain continuous media and subtitle processing when minimized.
6. **Exclusive TimedText Format (`json3`) & Sub-Line Highlighting**: Always request and preserve the `json3` subtitle format (`fmt=json3`) on YouTube `timedtext` API calls. Do not support `.srt` formats or override `fmt` to `srt`. Subtitle renderers MUST highlight active word/phrase segments (`segs[]`) in real time based on JSON3 segment offset timestamps (`tStartMs + tOffsetMs`).
7. **Android Zero-Calculation Native Translation**: On Android, translations are obtained without client-side alignment calculations by leveraging YouTube's native `json3` timedtext format. The native interceptor repeats the original `timedtext` API call with the target language code (`tlang=X`) and pairs translated cue strings directly based on native JSON3 event line index / sequence location within identical timeframes. Complete specifications are documented in `docs/specifications/json3.md`.
8. **Minimalist & Clean Interface Design**: Avoid cluttering the UI with unnecessary controls, redundant buttons, or excessive configuration options. Maintain a clean, highly focused presentation where all text, cues, and typography are strictly aligned.
9. **Curated Three-Theme Palette System**: Support selection between exactly three curated themes (e.g., Minimal Light, Pure Dark, Warm Slate/Sepia). Each theme must utilize a strictly constrained, minimal color palette to guarantee contrast and visual clarity.
10. **In-Flow Element Control & Minimal Space Undo**: Avoid arbitrary floating overlay elements. Any UI block or component must be removable in-flow, with an inline undo mechanism that consumes minimal screen footprint.
11. **View Deprecation & Alternative View Adoption**: Legacy presentation views are deprecated in favor of clean alternative pure view implementations defined in `docs/designs/DESIGN_SUBTITLE_VIEWS.md`.

---

## 12. Directive Execution & Planning Protocol

When processing incoming user prompts and directives, the agent must adhere to a systematic planning and documentation protocol:

### 1. Concise Response Mandate
- **No Verbose Prompt Outputs**: Avoid generating long, detailed text plans or architectural breakdowns directly inside prompt chat responses.
- **High-Level Status Only**: Prompt responses must be concise, scannable, and focused strictly on high-level outcomes and task completion confirmations.

### 2. Detailed Specs in `PLAN_*.md` Files
- **Mandatory Markdown Plan Files**: All detailed answers, architectural designs, technical specifications, and step-by-step dev execution flows MUST be written and persisted inside dedicated `PLAN_*.md` files in the `docs/plans/` directory (e.g., `docs/plans/PLAN_ANDROID_UPDATES.md`, `docs/plans/PLAN_SUBTITLE_VIEWS.md`).
- **Standardized Structure (`PLAN_TEMPLATE.md`)**: Plans must follow the uniform layout defined in `docs/plans/PLAN_TEMPLATE.md` (Objective, Component Interfaces, Data Flow/State Transitions, Platform Boundaries, Test Matrix).

### 3. Architecture Decision Records (`DECISIONS.md`)
- **Immutable ADR Log**: Major structural decisions, format deprecations, and platform constraints MUST be logged in `docs/operations/DECISIONS.md` (e.g., ADR-001: Sole adoption of YouTube JSON3; ADR-002: Android native `tlang` zero-calculation translation).
- **Rationale Preservation**: Each ADR records context, chosen options, and consequences to prevent re-debating settled architectural constraints.

### 4. Centralized Priority Index (`TASKS.md`)
- **Single Source of Truth**: All tasks, feature requests, and system objectives MUST be indexed, prioritized, and linked in `docs/operations/TASKS.md`.
- **Target & Priority Tracking**: `docs/operations/TASKS.md` manages task statuses (`[P0]`, `[P1]`, `[todo]`, `[in-progress]`, `[done]`), assigning target priorities and referencing the associated `PLAN_*.md` file for deep technical context.

### 5. Active Execution Scratchpad (`temp.md` managed under `TASKS.md`)
- **Managed Scratchpad**: `temp.md` (at root) is directly managed under `docs/operations/TASKS.md` as the live execution runner for the currently active task ID.
- **Step-by-Step Lifecycle**: Explicitly mark sub-task statuses (`[todo]`, `[done]`, `[test]`, `[fix]`) in `temp.md` during execution, updating `docs/operations/TASKS.md` and relevant `PLAN_*.md` files upon task completion.

### 6. Directive Archiving & Link Integrity
- **Prompt History (`PROMPT_OLD.md`)**: Upon directive completion, append completed task prompts to `docs/operations/PROMPT_OLD.md` to maintain a lean active `docs/operations/PROMPT.md`.
- **Cross-Reference Integrity**: Maintain valid relative markdown links across `AGENTS.md`, `docs/operations/TASKS.md`, `docs/operations/DECISIONS.md`, and `docs/plans/PLAN_*.md` files.

### 7. Documentation Order & Root Hygiene Mandate
- **Clean Root Policy**: Keep the repository root free of clutter by proactively placing all documentation, designs, schemas, and operational files inside their corresponding subdirectories under `docs/` (`docs/plans/`, `docs/designs/`, `docs/specifications/`, `docs/operations/`).
- **No Unsolicited Root Markdown**: Only `AGENTS.md`, `README.md`, and the active runner `temp.md` are permitted at the root level. All other `.md` files must reside in `docs/`.
- **MkDocs & Path Synchronization**: Whenever documentation is moved or added, ensure links in `mkdocs.yml`, `docs/index.md`, `docs/operations/TASKS.md`, and `AGENTS.md` remain valid and fully synchronized.

---

## 13. Android Application Update Methods

The application supports three distinct update mechanisms to accommodate both live end-user updates and developer workstation deployment:

### 1. In-App OTA Release Artifact Hot-Updater (Web Asset Bundle Swap)
- **Engine**: Implemented in `src/utils/apkUpdater.ts` and verified via `npm run test:ota`.
- **Mechanism**: Automatically checks GitHub Releases for newer release tags (`vX.Y.Z`). When a newer release contains `web-dist.zip` (or web bundle artifact), it downloads, unzips, and invokes `AndroidNativeShell.applyReleaseArtifact(downloadUrl, tag)`.
- **Outcome**: Swaps the web asset bundle dynamically inside the native WebView container without requiring a full APK re-installation or ADB connection.

### 2. In-App Full APK Download & OS Package Installer
- **Engine**: Implemented in `src/utils/apkUpdater.ts`.
- **Mechanism**: For major native binary changes, queries GitHub Releases for `YouTube-Viewer-debug.apk`. Upon user confirmation, downloads the binary package and hands it over to the native Android Package Installer (`Intent.ACTION_VIEW` for `application/vnd.android.package-archive`).
- **Outcome**: Triggers standard native Android update prompt to upgrade the installed application APK.

### 3. Workstation ADB Automated CLI Script (`update.apk.sh`)
- **Script**: `./update.apk.sh [latest|version|url]` (or legacy `./install-apk.sh`).
- **Mechanism**: Automated shell script for developer environments (Git Bash on Windows, macOS, Linux). Connects to GitHub API (`api.github.com/repos/...`), downloads the latest release APK to `~/Downloads`, resolves ADB paths, handles Windows path normalization (`MSYS_NO_PATHCONV`), and executes `adb install -r -g` followed by launching `com.ytviewer.app/.MainActivity`.
- **Outcome**: Replaces or installs the app binary directly on connected Android devices/emulators via ADB USB debugging.

---

## 14. Summary of Architectural Mission

- **Views are replaceable**: Any UI component can be rewritten or swapped without breaking data flow.
- **Contracts are the truth**: Markdown specifications define component inputs, responsibilities, and outputs.
- **Components are pure**: External providers inject data; views simply render and emit user callbacks.
- **Fixtures are first-class**: The fixture library provides deterministic, verified offline datasets.
- **Total Reconstruction Ready**: The `.md` contracts fully document data shapes, algorithms, and event flows so the complete frontend can be regenerated or migrated across different frameworks.
