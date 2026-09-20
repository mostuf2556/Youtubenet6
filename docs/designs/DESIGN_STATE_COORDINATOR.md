# State Coordinator Specification (`DESIGN_STATE_COORDINATOR.md`)

This document defines the abstract finite state machine, state transitions, active cue resolution algorithms, and state flow coordination for the subtitle learning platform.

---

## 1. Architectural Role

The State Coordinator centralizes application state, decoupling media playback, subtitle cue selection, TTS speech synthesis loops, and view presentation into an explicit, deterministic state machine:

```text
[ Player Tick Stream ] ──┐
[ Subtitle Tracks ]    ──┼──► [ State Coordinator FSM ] ──► [ Pure Views (Props) ]
[ User Gestures ]      ──┘                 │
                                           ▼ (Dispatches)
                                   [ Audio/TTS Engine ]
```

---

## 2. Core Application States

The application state machine defines the following primary states:

| State | Description | Allowed Next States |
| :--- | :--- | :--- |
| **`IDLE`** | No video loaded; waiting for URL ingestion or library selection. | `LOADING` |
| **`LOADING`** | Initializing player, fetching subtitle tracks from fixtures or network. | `READY`, `ERROR` |
| **`READY`** | Player cued, subtitles loaded, ready for playback. | `PLAYING_VIDEO`, `PAUSED` |
| **`PLAYING_VIDEO`** | Video is playing dialogue; actively resolving subtitle cues and word segments. | `SPEAKING_TTS`, `PAUSED`, `SEEKING` |
| **`SPEAKING_TTS`** | Video paused at cue boundary; synthesizing target-language translation audio. | `PLAYING_VIDEO`, `PAUSED`, `SEEKING` |
| **`PAUSED`** | Playback halted by user or manual intervention. | `PLAYING_VIDEO`, `SEEKING`, `IDLE` |
| **`SEEKING`** | User seeking to a new timestamp or selecting an arbitrary cue. | `PLAYING_VIDEO`, `PAUSED` |
| **`ERROR`** | Network failure, invalid video ID, or missing subtitles without fallback. | `IDLE`, `LOADING` |

---

## 3. Active Cue Resolution Algorithm

To ensure continuous, zero-drift synchronization between media playback and subtitle presentation:

1. **Binary Search / Bounded Scan**: Given current playback timestamp $t$:
   $$\text{Find } \text{cue} \in \text{cues} \quad \text{such that} \quad \text{cue.start} \le t < \text{cue.start} + \text{cue.duration}$$
2. **Hysteresis Buffer**: A 50ms tolerance margin prevents flickering when playback hovers across cue boundaries.
3. **Sub-Line Segment Highlighting**:
   When active cue is found, iterate `cue.segs[]` using segment offset:
   $$\text{segmentStart} = \text{cue.start} + \frac{\text{seg.tOffsetMs}}{1000}$$
   The active word segment is the one where $\text{segmentStart} \le t < \text{segmentEnd}$.

---

## 4. Sentence-by-Sentence Auto-TTS Coordination Loop

When Auto-TTS is enabled:
1. Video plays the full native dialogue for the duration of the cue (`cue.start` to `cue.start + cue.duration`).
2. At cue completion ($t \ge \text{cue.start} + \text{cue.duration}$), coordinator pauses video playback.
3. Coordinator invokes the TTS Engine with the active cue's target-language translation.
4. Upon receiving `onDone()` notification from TTS engine:
   - Resumes video playback.
   - Advances tracking index to prevent duplicate playback of the same cue.
