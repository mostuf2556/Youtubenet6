# `json3.md` — YouTube JSON3 TimedText Specification & Native Zero-Calculation Translation Strategy

## 1. Overview & Format Specifications

YouTube's `json3` timedtext format is the canonical subtitle transport used by the application across both the web companion and the Android native host. Unlike legacy SubRip (`.srt`) files, which flatten cue text into plain blocks, `json3` preserves structured event arrays with millisecond precision, per-segment timing offsets, and language-specific delivery consistency.

### Mandatory Format Rule
- Always preserve `fmt=json3` on every YouTube caption request.
- Never replace the format with `.srt`, XML, or any non-JSON3 timedtext variant.
- Treat `json3` as the only accepted source of subtitle timing and segment metadata.

### Implementation Contract
This specification is not just a description of YouTube payloads; it is the source-of-truth contract for:
- the fixture parser used by the browser companion,
- the Android request interceptor used by the native shell,
- the cue renderer used for live subtitle highlighting,
- and the translation pairing model used for target-language playback.

---

## 2. Canonical JSON3 Payload Shape

A typical YouTube `json3` payload is built from a top-level metadata block and an `events` array, where each event is a cue line that may be split into multiple word or phrase segments.

```json
{
  "wireMagic": "pb3",
  "pens": [ { "id": 0 } ],
  "wsWinStyles": [ { "id": 0 } ],
  "wpWinPositions": [ { "id": 0 } ],
  "events": [
    {
      "tStartMs": 1200,
      "dDurationMs": 2400,
      "segs": [
        { "utf8": "Welcome " },
        { "utf8": "to " },
        { "utf8": "the " },
        { "utf8": "course.", "tOffsetMs": 800 }
      ]
    }
  ]
}
```

### Canonical Field Definitions
- `wireMagic`: Required protocol marker for JSON3 payloads (`"pb3"`).
- `events[]`: Ordered subtitle cue list keyed by playback timeline.
- `tStartMs`: The cue start time in milliseconds.
- `dDurationMs`: Duration the cue remains visible on screen.
- `segs[]`: Word or phrase segments inside the cue.
- `utf8`: The textual value of a segment.
- `tOffsetMs`: Relative offset inside the cue after the cue start time.

### Parsing Rule
The render pipeline must treat `events` as the authoritative cue sequence and `segs` as the authoritative sub-line timing structure. All downstream logic, including playback highlight, translation alignment, and UI state transition, must be based on these values rather than ad-hoc recalculation.

---

## 3. Request Lifecycle and `fmt=json3` Preservation

### Android and Web Request Contract
All timedtext requests must preserve the original YouTube request shape as much as possible while still enabling language switching.

```http
GET https://www.youtube.com/api/timedtext?v=VIDEO_ID&lang=en&fmt=json3&c=WEB&cver=...&key=...
```

The following must remain intact when replaying or substituting a language:
- the original video identifier (`v`),
- the source language (`lang`),
- the format (`fmt=json3`),
- the original request headers and cookies when available,
- and any signature or version parameters already present on the request.

### Target Language Replay & Translation Service Deprecation
- **Strict Deprecation of Machine Translation Services**: Using any third-party translation service (such as Google Translate, Google GTX public endpoints, or on-demand translation APIs) to translate subtitle records is NOT accurate enough and is therefore **completely deprecated and forbidden**. Do not use external translation services at all!
- **Android Solution (`tlang` Parameter)**: To get subtitles in language X, the only accepted method is to append or replace the `tlang` parameter on the intercepted native request while preserving all headers, cookies, and `fmt=json3`:

```http
GET https://www.youtube.com/api/timedtext?v=VIDEO_ID&lang=en&tlang=he&fmt=json3&...
```

This keeps the native playback path aligned with YouTube's native server-side timing model instead of fabricating client-derived translations.

- **Web Solution (2-Video Fixture Artifacts)**: The web companion application is strictly for testing the application flow, UI validation, and demonstration — it is NOT intended for other general subtitle extraction without fixtures. It consumes pre-recorded offline JSON3 fixture artifacts for 2 example video IDs (`test/fixtures/L2Ryrr6txwA/` and `test/fixtures/FcRzAdI8R9U/`).
- **Test Visibility Mandate**: In case the native solution using `tlang` parameter replacement is not working, is blocked, or returns an error, the failure MUST be immediately visible in automated tests (Android E2E tests, network interception tests, and CI report integrity checks) rather than silently falling back to machine translations.

---

## 4. Zero-Calculation Translation Strategy

On the Android native host, translation alignment is performed without client-side timestamp math or cue matching heuristics.

### Architectural Concept
When a user enables subtitles or toggles translation on Android:

```text
Intercepted timedtext request (lang=en, fmt=json3)
                  │
                  ├──► Fetch source-language JSON3 track
                  │
                  └──► Replay same request with tlang=<target>
                                          │
                                          ▼
                            Fetch target-language JSON3 track
                                          │
                                          ▼
                  Pair cue lines by event index: A[i] ↔ B[i]
```

### Why This Works
1. YouTube's server-side translation pipeline emits a target-language stream with an event list that matches the source-language stream's logical cue sequence.
2. For the same video and playback window, the cue index `i` corresponds to the same spoken moment in both streams.
3. Therefore, the direct pairing `sourceEvents[i]` and `targetEvents[i]` is the canonical translation alignment model.

### Canonical Alignment Rule
Do not calculate alignment using a custom algorithm unless the platform has verified that the native timedtext response is malformed or incomplete.

```typescript
function alignJson3Translations(
  sourceJson3: Json3Payload,
  targetJson3: Json3Payload,
): AlignedCue[] {
  const sourceEvents = sourceJson3.events.filter((event) => event?.segs?.length);
  const targetEvents = targetJson3.events.filter((event) => event?.segs?.length);

  return sourceEvents.map((sourceEvent, index) => {
    const targetEvent = targetEvents[index];
    const sourceText = sourceEvent.segs.map((segment) => segment.utf8 ?? '').join('').trim();
    const targetText = targetEvent ? targetEvent.segs.map((segment) => segment.utf8 ?? '').join('').trim() : '';

    return {
      id: `cue-${sourceEvent.tStartMs}`,
      startMs: sourceEvent.tStartMs,
      durationMs: sourceEvent.dDurationMs,
      text: sourceText,
      translationText: targetText,
      segments: sourceEvent.segs,
    };
  });
}
```

---

## 5. Edge Cases and Resilience Rules

The system must remain stable even when one of the JSON3 streams is slightly irregular.

1. Array length mismatch: if `targetEvents.length !== sourceEvents.length`, match by closest `tStartMs` when the difference is under 100 ms.
2. Empty or whitespace-only segments: skip event lines that contain no meaningful text.
3. Missing `segs`: treat as an empty cue and exclude it from highlight or translation rendering.
4. RTL normalization: when rendering Hebrew or Arabic, ensure proper BiDi behavior (`dir="rtl"` or equivalent layout support).
5. Duplicate timestamps: keep the original ordering from the YouTube payload rather than re-sorting before display.

---

## 6. Sub-Line Segment Syntax Highlighting

JSON3 supports true sub-line highlighting because each cue can contain multiple word or phrase segments with their own offsets.

### Active Cue Resolution
The renderer resolves the active line by checking whether playback time is within the cue window:

```text
activeCue = cue where tStartMs <= currentTimeMs < tStartMs + dDurationMs
```

### Relative Offset Resolution
Once the cue is selected, compute the relative playback offset:

```text
relativeMs = currentTimeMs - tStartMs
```

### Segment Activation Rule
For the active cue, iterate through `segs[]` and mark the segment as active when:

```text
relativeMs >= (segment.tOffsetMs || 0)
AND
relativeMs < (nextSegment?.tOffsetMs ?? dDurationMs)
```

This makes the current word or phrase visibly highlighted while leaving the rest of the line in its inactive state.

### Rendering Requirement
The full cue line must still render as a single subtitle line, but only the active segment receives the emphasis styling. Styling may include:
- a stronger text weight,
- a contrasting color,
- or a subtle background/tint treatment.

The active segment logic must be derived from `tOffsetMs` and never from approximated string boundaries.

---

## 7. Data Normalization Contract

The project must normalize each JSON3 cue into a consistent internal shape before it reaches the UI renderer.

```typescript
interface Json3Cue {
  tStartMs: number;
  dDurationMs: number;
  segs?: Array<{
    utf8?: string;
    tOffsetMs?: number;
  }>;
}

interface NormalizedCue {
  id: string;
  startMs: number;
  durationMs: number;
  text: string;
  translationText?: string;
  segments: Array<{ utf8?: string; tOffsetMs?: number }>;
}
```

Normalization must:
- preserve cue ordering,
- strip non-semantic whitespace only after the line is assembled,
- keep raw segment timing intact,
- and expose the original `segs` list to highlight logic.

---

## 8. Web Companion and Android Host Boundaries

### Web Companion
The web companion is a fixture-driven host. It must use local `test/fixtures/*` JSON3 payloads for deterministic UI validation, view regression, and caption rendering tests.

### Android Native Host
The Android host must intercept real timedtext traffic when allowed, preserve the original query string context, and replay the request with `tlang` for translated caption retrieval. It must not synthesize translations on the client.

The browser and Android host share the same abstract contract:
- `json3` input is canonical,
- cue order and timing are preserved,
- highlight logic uses segment offsets,
- and translation pairing relies on native server-side output rather than ad-hoc localization.

---

## 9. Acceptance Checklist

The implementation is complete when all of the following are true:

- [ ] `fmt=json3` is preserved on all timedtext requests.
- [ ] The app accepts only JSON3 timedtext payloads as canonical input.
- [ ] Cue indexing is preserved during source/target language comparisons.
- [ ] The active cue is resolved by time window, not by string heuristics.
- [ ] Segment highlighting uses `tOffsetMs` instead of visible text length.
- [ ] RTL languages render with the correct BiDi behavior.
- [ ] Web fixtures and Android native requests follow the same cue contract.

This file defines the invariant that all subtitle rendering, translation parity, and playback state logic must follow.
