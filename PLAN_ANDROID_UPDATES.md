# Architectural Plan: Android Application Update Methods (`PLAN_ANDROID_UPDATES.md`)

## 1. Overview & Purpose
This document provides the complete technical specification, developer execution workflows, and user presentation models for updating the native Android app shell and web assets across production release tags and workstation development environments.

---

## 2. Architecture & Update Channels

```text
                               ┌─────────────────────────────────────────┐
                               │         GitHub Releases API             │
                               │   (vX.Y.Z Tags & Release Artifacts)     │
                               └────────────────────┬────────────────────┘
                                                    │
           ┌────────────────────────────────────────┼────────────────────────────────────────┐
           │                                        │                                        │
           ▼                                        ▼                                        ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐        ┌──────────────────────────────┐
│  Channel 1: In-App OTA Hot   │        │ Channel 2: In-App Full APK   │        │ Channel 3: Workstation ADB   │
│     Release Artifact Swap    │        │     Native Package Installer │        │     Automated CLI Script     │
│    (`web-dist.zip` Bundle)   │        │   (`YouTube-Viewer-debug`)   │        │      (`update.apk.sh`)       │
└──────────────┬───────────────┘        └──────────────┬───────────────┘        └──────────────┬───────────────┘
               │                                       │                                       │
               ▼                                       ▼                                       ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐        ┌──────────────────────────────┐
│ Swaps `/dist` web bundle in  │        │ Prompts Android OS Package   │        │ Executes USB/Wi-Fi ADB       │
│ WebView via Native Bridge    │        │ Installer (`ACTION_VIEW`)    │        │ `adb install -r -g`          │
└──────────────────────────────┘        └──────────────────────────────┘        └──────────────────────────────┘
```

---

## 3. Detailed Specifications & Developer Workflows

### Channel 1: In-App OTA Release Artifact Hot-Updater (Web Asset Swap)
- **Engine**: `src/utils/apkUpdater.ts` (Verified via `npm run test:ota`).
- **Target Audience**: Active mobile users receiving UI upgrades, subtitle parser improvements, or bug fixes.
- **Developer Flow**:
  1. Build bundle: `npm run build`
  2. Zip distribution: `zip -r web-dist.zip dist/`
  3. Attach `web-dist.zip` to a new release tag `vX.Y.Z` on GitHub (`mostuf2556/Youtubenet6`).
  4. App queries GitHub API, downloads `web-dist.zip`, and calls `AndroidNativeShell.applyReleaseArtifact(downloadUrl, tag)`.
  5. WebView reloads seamlessly with new assets without needing a full APK re-install.

### Channel 2: In-App Full APK Download & Native OS Package Installer
- **Engine**: `src/utils/apkUpdater.ts`.
- **Target Audience**: Users updating native Android capabilities (network interception, TTS drivers, AndroidManifest).
- **Developer Flow**:
  1. Build Android debug APK: `./gradlew assembleDebug` in `android-shell/`.
  2. Attach `YouTube-Viewer-debug.apk` to GitHub release.
  3. App downloads APK to local storage and invokes `Intent.ACTION_VIEW` (`application/vnd.android.package-archive`).
  4. Android OS installer displays standard upgrade confirmation dialog.

### Channel 3: Workstation ADB Automated CLI Script (`update.apk.sh`)
- **Engine / Script**: `./update.apk.sh [latest|version|url]` (or `./install-apk.sh`).
- **Target Audience**: Workstation developers and automated device test benches.
- **Developer Flow**:
  1. Connect device or start emulator with USB/Wi-Fi debugging enabled (`adb devices`).
  2. Run command: `./update.apk.sh` (or `./update.apk.sh v1.0.16`).
  3. Script normalizes paths across Windows Git Bash (`MSYS_NO_PATHCONV`), macOS, and Linux.
  4. Script downloads release APK to `~/Downloads`, runs `adb install -r -g`, and launches `com.ytviewer.app/.MainActivity`.
