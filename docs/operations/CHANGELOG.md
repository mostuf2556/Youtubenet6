# Release Changelog & OTA Asset History (`CHANGELOG.md`)

Tracks production releases, OTA web asset bundle deployments (`web-dist.zip`), and Android APK binary updates.

---

## [v1.0.25] - 2026-09-19
### Added
- Standardized Markdown Workflow Protocol (`TASKS.md`, `PLAN_*.md`, `DECISIONS.md`).
- Active sub-line segment syntax highlighting based on JSON3 relative time offsets (`tStartMs + tOffsetMs`).
- Android Application Update Methods specification in `AGENTS.md` Section 12.

### Changed
- Deprecated SubRip (`.srt`) format support across the codebase in favor of standard YouTube `json3`.
- Updated OTA verification suite (`npm run test:ota`) for GitHub release asset validation.

---

## [v1.0.13] - 2026-09-15
### Added
- Android Native Shell WebView interceptor supporting `timedtext` parameter modification.
- In-app OTA Release Artifact Hot-Updater (`AndroidNativeShell.applyReleaseArtifact`).
