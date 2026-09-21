# Subtitle Fixture Library (LIBRARY.md)

## 1. Purpose & Scope

The subtitle fixture library is a core architectural component of the application. It provides deterministic, offline-capable subtitle datasets for development, visual verification, and automated browser testing without relying on live YouTube caption network requests.

- **Web Companion Role**: The web application is strictly for testing the application flow, UI validation, and demonstration — it is NOT intended for general user caption extraction without fixtures.
- **Reference JSON3 Artifacts**: The web companion provides bundled JSON3 fixture artifacts for `L2Ryrr6txwA` across multiple languages.
- **Deprecation of Translation Services**: Using Google Translate or on-demand translation APIs to translate subtitle records is completely deprecated and forbidden due to phrasing and timing inaccuracy. Target languages on Android are retrieved via native `tlang` interception; on Web, they are loaded directly from these 2-video fixture artifacts.

Because browser JavaScript cannot inspect or intercept cross-origin network traffic originating inside a standard YouTube `<iframe>`, the browser companion relies on this library to provide authentic JSON3 timed captions across multiple languages.

---

## 2. Library Location and Directory Structure

The fixture library resides at:

```text
test/fixtures/
```

Fixtures are strictly organized by YouTube video ID (`<VIDEO_ID>`):

```text
test/fixtures/<VIDEO_ID>/*.json
```

### Directory Layout Example

```text
test/fixtures/
└── L2Ryrr6txwA/                # YouTube Video ID
    ├── ar.json                 # Arabic Subtitles (YouTube JSON3 format)
    ├── en.json                 # English Subtitles (YouTube JSON3 format)
    ├── he.json                 # Hebrew Subtitles (YouTube JSON3 format)
    ├── it.json                 # Italian Subtitles (YouTube JSON3 format)
    └── ru.json                 # Russian Subtitles (YouTube JSON3 format)
```

---

## 3. YouTube JSON3 Timed Text (`.json`)
- **Extension**: `.json` (Note: Represents the YouTube timedtext JSON3 schema; not arbitrary JSON).
- **Structure**:
  - Root `events` array containing timed caption event objects.
  - `tStartMs` (integer milliseconds start time).
  - `dDurationMs` (integer milliseconds duration).
  - `segs` array containing text segment objects (`utf8` text string and optional character timing).
- **Reference Fixture**: `test/fixtures/L2Ryrr6txwA/*.json`
- **Preference**: JSON3 is the preferred format when fetching subtitles because it provides millisecond-accurate word/segment timing that enables rich word-level highlight synchronization.

---

## 4. How Fixtures Are Consumed by the Web Companion

1. **Provider Resolution**:
  When a user loads a video or selects a language track, the fixture provider scans `test/fixtures/<VIDEO_ID>/` for matching JSON3 files by language code.
2. **Format Normalization**:
  The parser parses the JSON3 file and normalizes it into a common `CaptionCue[]` array:
   ```ts
   interface CaptionCue {
     id: string;        // Unique identifier (e.g. "cue-1", "0")
     start: number;     // Start timestamp in seconds (float)
     duration: number;  // Display duration in seconds (float)
     text: string;      // Normalized subtitle display text
   }
   ```
3. **Dependency Injection**:
  The normalized `CaptionCue[]` array is injected into the pure subtitle renderer views defined in `DESIGN_SUBTITLE_VIEWS.md`.

---

## 5. Naming and Organization Conventions

- **Directory Name**: Must match the exact 11-character YouTube video ID (case-sensitive).
- **File Name**: Must be `<LANG_CODE>.<FORMAT>` where `<LANG_CODE>` is an ISO 639-1 or YouTube language code (e.g., `en`, `he`, `ar`, `it`, `ru`, `es`, `zh-CN`).
- **File Encoding**: Must be UTF-8 without BOM.
- **Error Behavior**: Empty or malformed fixture files must produce an explicit parsing error; they must not be presented as empty or valid subtitles.

---

## 6. Verification

The fixture library is validated via an automated format verification script:

```bash
npm run test:caption-formats
```

This command inspects all JSON3 fixtures under `test/fixtures/L2Ryrr6txwA/`, verifying format detection, timing validity (`start >= 0`, `duration > 0`), and non-empty cue text.
