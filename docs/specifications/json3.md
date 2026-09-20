# `json3.md` — YouTube JSON3 TimedText Specification & Native Zero-Calculation Translation Strategy

## 1. Overview & Format Specifications

YouTube's `json3` timedtext format is the primary, canonical subtitle format consumed by the application across both Web and Android platforms. Unlike legacy SubRip (`.srt`) files which flatten subtitle lines into plain text blocks, `json3` retains structured event arrays with millisecond-level start times, durations, and word-by-word segment offsets.

### Mandatory Format Rule
- **Always preserve `fmt=json3`**: All outgoing requests to YouTube's caption endpoint (`https://www.youtube.com/api/timedtext`) MUST request or retain `fmt=json3`.
- **Never replace `fmt` with `srt`**: Do NOT alter, strip, or replace the `fmt` query parameter to request SRT or XML formats.

---

## 2. YouTube JSON3 Data Schema

A YouTube `json3` payload consists of top-level video metadata and an `events` array containing individual subtitle cues and word segments:

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

### Key Field Definitions
- **`wireMagic`**: Format protocol marker (`"pb3"`).
- **`events[]`**: Array of timed subtitle events.
- **`tStartMs`**: Event start timestamp in milliseconds.
- **`dDurationMs`**: Event display duration in milliseconds.
- **`segs[]`**: Array of individual word/phrase segments within an event line.
- **`utf8`**: String content of the segment.
- **`tOffsetMs`**: Relative start offset (in milliseconds) of the segment from `tStartMs`.

---

## 3. Android Native Zero-Calculation Translation Strategy

On the Android native host (`android-shell/`), translation alignment is performed **without any client-side duration or timestamp calculation algorithms**.

### Architectural Concept
When a user enables subtitles or toggles translation on Android:

```text
[Intercepted Timedtext Request] (lang=en, fmt=json3, ...)
                  │
                  ├──► 1. Fetch Primary Subtitles (lang=en) ──► JSON3 Events Array A
                  │
                  └──► 2. Repeat Request with Target Language (tlang=he, fmt=json3, ...)
                                          │
                                          ▼
                                JSON3 Events Array B
                                          │
                                          ▼
                Direct Line Index Pairing: Events A[i] ◄──► Events B[i]
```

### Why Zero Calculation Works
1. YouTube's server-side translation engine generates translated `json3` streams where the `events` array structure corresponds **1-to-1** with the source `json3` stream.
2. The event index `i`, start timestamp `tStartMs`, and display duration `dDurationMs` of `events[i]` in Language A match `events[i]` in Target Language B.
3. Therefore, pairing translated cue lines does NOT require complex timestamp intersection math, fuzzy string matching, or client-side time-window overlap logic.

---

## 4. Network Interception & Request Replay Protocol

### Step 1: Request Interception
The native Android `WebViewClient` (`shouldInterceptRequest`) detects outgoing network calls to:
```http
GET https://www.youtube.com/api/timedtext?v=VIDEO_ID&lang=en&fmt=json3&...
```

### Step 2: Context Preservation & Replay
The interceptor captures the full HTTP request context (headers, cookies, user-agent, query parameters) and dispatches a secondary parallel request to fetch the translated track:
```http
GET https://www.youtube.com/api/timedtext?v=VIDEO_ID&lang=en&tlang=he&fmt=json3&...
```
- **Preserved Parameters**: `v`, `lang`, `fmt=json3`, `c`, `cver`, `signature`, `expire`, `key`.
- **Injected Parameter**: `tlang=<TARGET_LANG_CODE>` (e.g. `tlang=he` for Hebrew, `tlang=es` for Spanish).

### Step 3: Direct Index Alignment Algorithm
Once both JSON3 responses are parsed:

```typescript
function alignJson3Translations(sourceJson3: Json3Payload, targetJson3: Json3Payload): AlignedCue[] {
  const sourceEvents = sourceJson3.events.filter(e => e.segs && e.segs.length > 0);
  const targetEvents = targetJson3.events.filter(e => e.segs && e.segs.length > 0);

  return sourceEvents.map((sourceEvent, index) => {
    // Pick translation directly by line index
    const targetEvent = targetEvents[index];

    const sourceText = sourceEvent.segs.map(s => s.utf8).join('').trim();
    const targetText = targetEvent ? targetEvent.segs.map(s => s.utf8).join('').trim() : '';

    return {
      id: `cue-${sourceEvent.tStartMs}`,
      startMs: sourceEvent.tStartMs,
      durationMs: sourceEvent.dDurationMs,
      text: sourceText,
      translationText: targetText,
      segments: sourceEvent.segs
    };
  });
}
```

---

## 5. Edge Cases & Resilience Rules

1. **Array Length Mismatches**: If `targetEvents.length !== sourceEvents.length` due to empty audio gaps, fallback to matching `targetEvents` by `tStartMs` equality (`targetEvents.find(e => Math.abs(e.tStartMs - sourceEvent.tStartMs) < 100)`).
2. **Missing Segments**: Skip events that contain only formatting whitespace or lack a `segs` array.
3. **Right-to-Left (RTL) Normalization**: Apply BiDi direction indicators (`dir="rtl"`) when rendering target languages such as Hebrew (`he`) or Arabic (`ar`).

---

## 6. Sub-Line Segment Syntax Highlighting Algorithm

JSON3 enables word-by-word active caption highlighting during media playback:

1. **Active Event Resolution**: Find the active event line where `tStartMs <= currentTimeMs < tStartMs + dDurationMs`.
2. **Relative Time Calculation**: Compute the relative offset inside the active line: `relativeMs = currentTimeMs - tStartMs`.
3. **Active Segment Resolution**: Iterate through the segment array `segs[]`:
   - Segment `s[j]` is marked as active when `relativeMs >= (s[j].tOffsetMs || 0)` and `relativeMs < (s[j+1]?.tOffsetMs || dDurationMs)`.
4. **Inline Rendering**: Render the complete subtitle line section in the DOM while applying active syntax highlighting (e.g., primary theme highlight color, bold font weight, or subtle background tint) exclusively to the currently active segment span.
