# Architectural Plan Specification Template (`PLAN_TEMPLATE.md`)

Standard template for creating technical feature plans (`PLAN_*.md`).

---

# Architectural Plan: [Feature Name] (`PLAN_[FEATURE_NAME].md`)

## 1. Executive Summary & Objective
- High-level functional goal and problem statement.
- Target platform scope (Web Companion, Android Native Host, or both).

## 2. Component Hierarchy & Interfaces
- Pure component props and callback interfaces.
- Data structures and types.

## 3. Data Flow & State Machine Transitions
- Input data providers and state coordination.
- Transition matrix and event handlers.

## 4. Platform Boundaries & Constraints
- Specific Web browser vs. Android WebView native capabilities.
- Security, network interception, or storage rules.

## 5. Automated Verification & Test Matrix
- Unit tests, fixture tests, or E2E Playwright/Cypress scenarios.
- CI/CD workflow integration checks.
