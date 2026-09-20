# Architectural Plan: Documentation Organization & Subdirectory Structure (`PLAN_DOCS_ORGANIZATION.md`)

## 1. Executive Summary & Objective
- **Objective**: Standardize repository hygiene and documentation management by relocating loose markdown files from the project root into categorized subdirectories under `docs/`.
- **Target Scope**: Universal across repository operations, MkDocs navigation hierarchy, AI Studio developer instructions, and automated CI/CD documentation workflows.
- **Problem Statement**: Proliferation of markdown files in the project root creates visual clutter, complicates file discovery, and breaks conventions for static site generators like MkDocs.

## 2. Component Hierarchy & Directory Architecture
The documentation tree is organized into four core functional directories under `docs/`:

```text
/
├── AGENTS.md                          # AI System Instructions & Project Contract (Root Whitelist)
├── README.md                          # Repository Entry & Overview (Root Whitelist)
├── temp.md                            # Active Task Scratchpad Runner (Root Whitelist)
└── docs/
    ├── index.md                       # MkDocs Entry Index & Documentation Map
    ├── designs/                       # Pure View Design Contracts
    │   ├── DESIGN_CONTROLS_VIEW.md
    │   ├── DESIGN_SUBTITLE_VIEWS.md
    │   └── DESIGN_VIEW_LANGS.md
    ├── operations/                    # Operational Tracking & Architecture Logs
    │   ├── ACTIONS.md
    │   ├── CHANGELOG.md
    │   ├── COVERAGE.md
    │   ├── DECISIONS.md
    │   ├── PROMPT.md
    │   ├── PROMPT_OLD.md
    │   ├── RECOMMENDATION.md
    │   ├── replit.md
    │   └── TASKS.md
    ├── plans/                         # Architectural & Development Execution Plans
    │   ├── PLAN_ANDROID_UPDATES.md
    │   ├── PLAN_DOCS_ORGANIZATION.md
    │   └── PLAN_TEMPLATE.md
    └── specifications/                # Format Standards, Schemas & Fixtures
        ├── json3.md
        ├── LIBRARY.md
        └── SCHEMA_TIMEDTEXT.md
```

## 3. Data Flow & Link Integrity
- **Canonical Relative Linking**: All documentation cross-references must resolve relative paths correctly depending on their origin (e.g., intra-category `[TASKS.md](./TASKS.md)`, inter-category `[Plans](../plans/PLAN_*.md)`, root-to-doc `[Tasks](docs/operations/TASKS.md)`).
- **MkDocs Integration**: `mkdocs.yml` maps files relative to the `docs/` root (e.g., `plans/PLAN_ANDROID_UPDATES.md`, `designs/DESIGN_SUBTITLE_VIEWS.md`).
- **Scratchpad Continuity**: `temp.md` remains at the root level for immediate developer and agent access, while indexed directly under `docs/operations/TASKS.md`.

## 4. Platform Boundaries & Constraints
- **Root Whitelist**: Strictly limited to `AGENTS.md`, `README.md`, and `temp.md`. No new markdown files may be created at the project root.
- **Contract Preservation**: Moving documentation files must never alter the component contracts or behavioral specifications defined within them.

## 5. Automated Verification & Test Matrix
- **File Location Verification**: Assert zero unwhitelisted `.md` files at repository root.
- **MkDocs Schema Check**: Validate that all documentation paths defined in `mkdocs.yml` resolve to existing files.
- **Codebase Tests**: Ensure `npm run lint`, `npm run test:caption-formats`, and `npm run test:ota` continue to pass without regression.
