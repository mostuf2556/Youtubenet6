# JSON3 Subtitle Normalization

## Purpose

Raw YouTube JSON3 tracks are timed event streams, not guaranteed sentence
records. Different language tracks can split one spoken sentence into different
event counts or boundaries. Switching tracks by event index can therefore move
the learner into the middle of a sentence.

The web companion supports two fixture sources for `L2Ryrr6txwA`:

- `test/fixtures/L2Ryrr6txwA/`: raw YouTube JSON3 payloads.
- `test/fixtures/L2Ryrr6txwA_normalized/`: stable playback windows projected
  across all language tracks.

The player source button changes only the fixture source. Native Android
timedtext interception and live subtitle fetching continue to use raw JSON3.

## JSON3 Input

The canonical payload contains an `events` array. Each event has a start time,
duration, and optional text segments:

```json
{
  "tStartMs": 1200,
  "dDurationMs": 2400,
  "segs": [
    { "utf8": "Welcome " },
    { "utf8": "to the course", "tOffsetMs": 800 }
  ]
}
```

The parser preserves segment offsets as seconds relative to the cue. It also
decodes HTML entities, removes zero-width characters, fixes common mojibake,
and skips metadata-only events without text.

## Normalization Algorithm

`normalizeJson3Tracks` in `src/utils/captionParser.ts` uses the English track as
the reference timeline for this fixture. Each spoken reference event creates a
stable window from its start until the next reference event. Events from every
other language are assigned to a window when their time ranges overlap it.

For each normalized cue the parser:

1. Keeps the reference window start and duration.
2. Concatenates all overlapping language event segments in source order.
3. Rebases each segment's `tOffsetMs` against the normalized window.
4. Emits a stable `normalized-cue-N` identifier for cross-language switching.

This is timestamp-based projection, not translation or text-based sentence
matching. It keeps the learner on the same playback window when changing
languages, even when the source tracks contain different event counts.

## Normalized Artifact Shape

Each normalized language file contains:

```json
{
  "format": "normalized-json3",
  "videoId": "L2Ryrr6txwA",
  "referenceLanguage": "en",
  "cues": [
    {
      "id": "normalized-cue-1",
      "start": 0.08,
      "duration": 1.759,
      "text": "...",
      "segments": [
        { "text": "...", "offset": 0 }
      ]
    }
  ]
}
```

Use `parseRawCaptionData` for either raw JSON3 or normalized artifacts. Use
`parseNormalizedSubtitleData` when a caller needs to require the normalized
artifact format explicitly.

## Regeneration and Verification

Regenerate the checked-in artifacts after changing the raw fixture or the
normalization algorithm:

```bash
npx tsx scripts/normalize-json3-fixtures.ts
npm run test:caption-formats
npm run lint
```

The format verifier checks both directories for valid timing and non-empty cue
text. Normalized files are generated artifacts and should be kept synchronized
with their raw source tracks.