# Master Task Priority Index (`TASKS.md`)

Central index for system tasks, active development priorities, technical plan references, and live execution scratchpads.

---

## ⚡ Active Execution Scratchpad (`temp.md`)

The live scratchpad [`temp.md`](../../temp.md) is actively managed under this `TASKS.md` index. It holds the step-by-step sub-task lifecycle (`[todo]`, `[done]`, `[test]`, `[fix]`) for the currently in-progress task.

- **Current Active Task**: `TASK-008` (Collect and move .md files to docs/ subfolders)
- **Active Scratchpad Pointer**: [`temp.md`](../../temp.md)

---

## 📌 Active & Completed Task Index

| Priority | Task ID | Description | Status | Plan Reference |
| :--- | :--- | :--- | :--- | :--- |
| **[P0]** | `TASK-001` | Establish `AGENTS.md` Strategy: Concise Responses, `PLAN_*.md` Specs, and `TASKS.md` Indexing | `[done]` | `AGENTS.md` (Section 11) |
| **[P0]** | `TASK-002` | Document Android Application Update Methods & Dev Workflows | `[done]` | [`PLAN_ANDROID_UPDATES.md`](../plans/PLAN_ANDROID_UPDATES.md) |
| **[P0]** | `TASK-006` | Integrate & Manage Active Scratchpad (`temp.md`) under `TASKS.md` | `[done]` | [`TASKS.md`](./TASKS.md), `AGENTS.md` |
| **[P0]** | `TASK-007` | Integrate Recommendations into `AGENTS.md` (`DECISIONS.md`, `CHANGELOG.md`, `PLAN_TEMPLATE.md`) | `[done]` | [`RECOMMENDATION.md`](./RECOMMENDATION.md), `AGENTS.md` |
| **[P0]** | `TASK-008` | Establish Root Markdown Hygiene & Relocate Documents to `docs/` Subdirectories | `[done]` | [`PLAN_DOCS_ORGANIZATION.md`](../plans/PLAN_DOCS_ORGANIZATION.md), `AGENTS.md` |
| **[P1]** | `TASK-003` | Deprecate Legacy `.srt` Format & Enforce JSON3 Sub-Line Segment Highlighting | `[done]` | [`json3.md`](../specifications/json3.md), `AGENTS.md` (Section 5) |
| **[P1]** | `TASK-004` | Enforce Minimalist Layout, 3-Theme System, & Pure View Component Contracts | `[done]` | [`DESIGN_SUBTITLE_VIEWS.md`](../designs/DESIGN_SUBTITLE_VIEWS.md), `AGENTS.md` (Section 10) |
| **[P2]** | `TASK-005` | Maintain Unmocked Android Real-World `tlang` Native Interception Test Scenario | `[in-progress]` | `AGENTS.md` (Section 6.2) |

---

## 🎯 Task Execution Rules
1. **Chat Responses**: Keep prompt outputs brief and high-level.
2. **Technical Plans**: Always write detailed architectural designs and dev flows into dedicated `PLAN_*.md` files.
3. **Index Management**: Link and update task priorities in `TASKS.md` upon completing or queueing tasks.
4. **Live Execution Control**: Manage `temp.md` directly under `TASKS.md` as the active sub-task tracker for the in-progress task.
