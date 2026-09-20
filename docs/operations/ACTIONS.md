# GitHub Actions Workflows & CI/CD Pipelines (`ACTIONS.md`)

This document details the automated GitHub Actions CI/CD workflows, build pipelines, and artifact deployment architectures for the YouTube Subtitle Learning Platform.

---

## 1. Overview of Automated Pipelines

The repository maintains four dedicated GitHub Actions workflows to guarantee test coverage, release automation, and continuous live demonstration across Web and Android platforms:

| Workflow File | Trigger Events | Primary Responsibilities | Target Artifacts |
| :--- | :--- | :--- | :--- |
| **`release-apk.yml`** | Tag push (`v*`), Manual dispatch | Compiles Android native debug APK and packages web bundle. | `YouTube-Viewer-debug.apk`, `web-dist.zip` |
| **`web.yml`** | Push to `main`, PRs | Runs web companion end-to-end tests across Playwright and Cypress. | Playwright trace, Mochawesome HTML reports |
| **`emulation.yml`** | Push to `main`, PRs | Runs Android emulator instrumentation and WebView interception tests. | `android-emulator-report.html`, logcat captures |
| **`deploy-demo.yml`** | Push to `main` (auto) | Builds production web demo and deploys to GitHub Pages (`gh-pages`). | GitHub Pages web app and test dashboards |

---

## 2. Workflow Specifications

### 2.1 Release APK & Web Bundle (`release-apk.yml`)
- **Objective**: Generates release-ready binary artifacts whenever a version tag (`vX.Y.Z`) is pushed to the repository.
- **Key Steps**:
  1. Sets up JDK 17 and Android SDK environment.
  2. Runs Gradle build (`./gradlew assembleDebug`) in `android-shell/`.
  3. Builds production web client via `npm run build`.
  4. Archives the compiled web assets into `web-dist.zip` for OTA hot-updates.
  5. Attaches both `YouTube-Viewer-debug.apk` and `web-dist.zip` to the newly created GitHub Release.
- **Update Channel**: Consumed by `update.apk.sh` (ADB CLI installer) and `src/utils/apkUpdater.ts` (in-app OTA hot-updater).

### 2.2 Web Companion E2E Suite (`web.yml`)
- **Objective**: Automated browser validation in headless Linux CI environments.
- **Key Steps**:
  1. Checks out repository and configures Node.js 20.
  2. Installs dependencies (`npm ci`).
  3. Validates subtitle fixture schema (`npm run test:caption-formats`).
  4. Validates markdown link cross-references (`npm run test:md`).
  5. Executes Playwright test suite (`npm run test:e2e:web`).
  6. Executes Cypress test suite (`npm run test:cy:web`).
  7. Publishes test artifacts to GitHub Actions run summaries.

### 2.3 Android Emulator Suite (`emulation.yml`)
- **Objective**: Runs unmocked Android WebView network interception and hardware TTS synchronization on an Android emulator (API 34).
- **Key Steps**:
  1. Initializes KVM hardware-accelerated Android emulator.
  2. Boots Android 14 (API 34) Google APIs system image.
  3. Installs debug APK onto the emulator via ADB.
  4. Runs `scripts/run-android-e2e.sh` to assert:
     - `shouldInterceptRequest` captures live YouTube timedtext API requests.
     - Dynamic `tlang` modification fetches translated cues without timing drift.
     - Native TTS audio coordination completes with zero playback overlap.
  5. Generates `android-emulator-report.html` and captures logcat streams.

### 2.4 GitHub Pages Deployment (`deploy-demo.yml`)
- **Objective**: Continuously publishes the latest static companion app and interactive test runner to GitHub Pages.
- **URL**: `https://mostuf2556.github.io/Youtubenet6/`
- **Key Steps**:
  1. Compiles client static bundles.
  2. Bundles Cypress interactive runner and Mochawesome reports.
  3. Deploys combined directory to `gh-pages` branch via GitHub Actions pages deployer.

---

## 3. Test Failure Diagnostics & CI Log Triage

Per `AGENTS.md` Section 9, whenever requested to diagnose or rectify test failures, inspect the primary workflow logs directly:
- **Web E2E Pipeline**: [https://github.com/mostuf2556/Youtubenet6/actions/workflows/web.yml](https://github.com/mostuf2556/Youtubenet6/actions/workflows/web.yml)
- **Android Emulation Pipeline**: [https://github.com/mostuf2556/Youtubenet6/actions/workflows/emulation.yml](https://github.com/mostuf2556/Youtubenet6/actions/workflows/emulation.yml)
