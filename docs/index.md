# YouTube Subtitle Learning Platform Documentation

Welcome to the documentation suite for the **YouTube Subtitle Learning Platform**.

This platform provides a modular subtitle-rendering engine running across two hosts:
- **Browser Companion**: A fixture-driven web application for testing and subtitle viewing.
- **Android Native Shell**: A native container inspecting WebView traffic to intercept YouTube `timedtext` API calls and perform zero-calculation native translations (`tlang`).

---

## 📚 Documentation Map

### 📐 Architectural Plans
- [Android Application Update Methods](plans/PLAN_ANDROID_UPDATES.md)
- [Documentation Structure & Deployment Plan](plans/PLAN_DOCS_ORGANIZATION.md)
- [Technical Specification Template](plans/PLAN_TEMPLATE.md)

### 🎨 Pure View Design Contracts
- [Subtitle Views Specification](designs/DESIGN_SUBTITLE_VIEWS.md)
- [Language Selection Views](designs/DESIGN_VIEW_LANGS.md)
- [Playback Controls View](designs/DESIGN_CONTROLS_VIEW.md)
- [Player Provider Contract](designs/DESIGN_PLAYER_PROVIDER.md)
- [State Coordinator Machine](designs/DESIGN_STATE_COORDINATOR.md)

### 🔬 Technical Schemas & Data
- [YouTube JSON3 TimedText Format](specifications/json3.md)
- [TimedText Format Schema](specifications/SCHEMA_TIMEDTEXT.md)
- [Subtitle Fixture Library Index](specifications/LIBRARY.md)

### ⚙️ Operations & ADRs
- [Master Task Index](operations/TASKS.md)
- [Active Prompt Requirements](operations/PROMPT.md)
- [Prompt History Archive](operations/PROMPT_OLD.md)
- [Architecture Decision Records (ADRs)](operations/DECISIONS.md)
- [Release Tag & Asset Changelog](operations/CHANGELOG.md)
- [Diagnostic Debugger Specification](operations/DEBUG.md)
- [Automated GitHub Actions CI/CD](operations/ACTIONS.md)
- [Test Coverage Matrix](operations/COVERAGE.md)
- [Replit Configuration & Deployment](operations/replit.md)
- [Workflow Recommendations](operations/RECOMMENDATION.md)
