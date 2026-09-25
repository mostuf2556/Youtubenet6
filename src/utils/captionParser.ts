import { CaptionCue } from '../types';
import type { SubtitleSegment } from '../viewer/contracts';

/**
 * Caption Parser Utility
 * Parses raw YouTube JSON3 caption data.
 * Also provides encoding fixup, base64 decoding, timestamp formatting, and export helpers.
 */

export interface ParsedCaptionResult {
  format: 'json3' | 'unknown';
  cues: CaptionCue[];
}

export interface NormalizedSubtitleArtifact {
  format: 'normalized-json3';
  videoId: string;
  referenceLanguage: string;
  cues: CaptionCue[];
}

// ─── Encoding Helpers ───────────────────────────────────────────

export function decodeBase64ToUtf8(base64: string): string {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return base64;
  }
}

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': '\u00A0',
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
  '&laquo;': '«',
  '&raquo;': '»',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&deg;': '°',
  '&para;': '¶',
  '&middot;': '·',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
};

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  let result = text;
  // Named entities
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.split(entity).join(char);
  }
  // Numeric entities: &#1234; or &#x4D2;
  result = result.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return result;
}

export function fixMojibake(text: string): string {
  if (!text) return '';
  // Detect common UTF-8 mojibake patterns and attempt to fix
  // Pattern: text that was UTF-8 but decoded as Latin-1/Windows-1252
  try {
    // Check if text contains typical mojibake indicators
    if (/Ã[\u0080-\u00BF]|Â\u00A0|Ã\u00A0/.test(text)) {
      // Re-encode as Latin-1 then decode as UTF-8
      const bytes = new Uint8Array(text.length);
      let byteLen = 0;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code < 256) {
          bytes[byteLen++] = code;
        } else {
          // Can't fix this with simple re-encoding
          return decodeHtmlEntities(text);
        }
      }
      const fixed = new TextDecoder('utf-8').decode(bytes.subarray(0, byteLen));
      return decodeHtmlEntities(fixed);
    }
  } catch {}
  return decodeHtmlEntities(text);
}

export function cleanAndFixEncoding(text: string): string {
  if (!text) return '';
  let result = text;
  // Fix double-encoded HTML entities
  result = result.replace(/&amp;(amp|lt|gt|quot|#39|apos|nbsp);/g, '&$1;');
  // Fix mojibake
  result = fixMojibake(result);
  // Decode remaining HTML entities
  result = decodeHtmlEntities(result);
  // Normalize whitespace
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Remove zero-width characters
  result = result.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  return result.trim();
}

// ─── Timestamp Helpers ──────────────────────────────────────────

export function formatTimestamp(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const totalSec = Math.floor(seconds);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── JSON3 Parser ────────────────────────────────────────────────
// YouTube JSON3 format:
// { "events": [ { "tStartMs": 0, "dDurationMs": 4000, "segs": [{ "utf8": "text" }] } ] }

interface Json3Event {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: Array<{ utf8?: string; tOffsetMs?: number }>;
}

function readJson3Events(raw: string): Json3Event[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data?.events) ? data.events : [];
  } catch {
    return [];
  }
}

function eventText(event: Json3Event): string {
  return cleanAndFixEncoding((event.segs || []).map((seg) => seg?.utf8 || '').join(''));
}

function parseJson3(raw: string): CaptionCue[] {
  const cues: CaptionCue[] = [];
  try {
    const events = readJson3Events(raw);

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event) continue;

      const startMs = event.tStartMs ?? 0;
      const durMs = event.dDurationMs ?? 2000;
      const start = startMs / 1000;
      const duration = durMs / 1000;

      // Build text from segments
      const text = eventText(event);
      if (!text || !text.trim()) continue;

      const segments: SubtitleSegment[] = (event.segs || [])
        .filter((seg) => typeof seg?.utf8 === 'string' && seg.utf8.length > 0)
        .map((seg) => ({ text: cleanAndFixEncoding(seg.utf8 || ''), offset: Math.max(0, (seg.tOffsetMs || 0) / 1000) }));

      cues.push({
        id: `cue-${i + 1}`,
        start,
        duration: Math.max(0.5, duration),
        text,
        segments,
      });
    }
  } catch (err) {
    console.warn('[captionParser] JSON3 parse error:', err);
  }

  return cues;
}

function isNormalizedArtifact(value: unknown): value is NormalizedSubtitleArtifact {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value as NormalizedSubtitleArtifact).format === 'normalized-json3' &&
      Array.isArray((value as NormalizedSubtitleArtifact).cues)
  );
}

export function parseNormalizedSubtitleData(rawData: string): ParsedCaptionResult {
  try {
    const parsed: unknown = JSON.parse(rawData);
    if (!isNormalizedArtifact(parsed)) return { format: 'unknown', cues: [] };
    return { format: 'json3', cues: parsed.cues };
  } catch {
    return { format: 'unknown', cues: [] };
  }
}

/** Creates stable playback windows from a reference track and projects every language onto them by timestamp overlap. */
export function normalizeJson3Tracks(
  rawTracks: Record<string, string>,
  referenceLanguage = 'en',
  videoId = ''
): Record<string, NormalizedSubtitleArtifact> {
  const referenceEvents = readJson3Events(rawTracks[referenceLanguage] || '')
    .map((event) => ({ event, startMs: event.tStartMs || 0, endMs: (event.tStartMs || 0) + (event.dDurationMs || 2000), text: eventText(event) }))
    .filter((item) => item.text.trim());

  return Object.fromEntries(
    Object.entries(rawTracks).map(([language, raw]) => {
      const events = readJson3Events(raw)
        .map((event) => ({ event, startMs: event.tStartMs || 0, endMs: (event.tStartMs || 0) + (event.dDurationMs || 2000), text: eventText(event) }))
        .filter((item) => item.text.trim());
      const cues = referenceEvents.map((window, index) => {
        const nextStartMs = referenceEvents[index + 1]?.startMs;
        const endMs = nextStartMs && nextStartMs > window.startMs ? nextStartMs : window.endMs;
        const overlapping = events.filter((item) => item.startMs >= window.startMs && item.startMs < endMs);
        const segments: SubtitleSegment[] = [];
        const textParts: string[] = [];
        overlapping.forEach((item) => {
          const baseOffset = Math.max(0, item.startMs - window.startMs) / 1000;
          (item.event.segs || []).forEach((segment) => {
            if (!segment?.utf8) return;
            const text = cleanAndFixEncoding(segment.utf8);
            if (!text) return;
            textParts.push(text);
            segments.push({ text, offset: baseOffset + Math.max(0, segment.tOffsetMs || 0) / 1000 });
          });
        });
        return {
          id: `normalized-cue-${index + 1}`,
          start: window.startMs / 1000,
          duration: Math.max(0.5, (endMs - window.startMs) / 1000),
          text: cleanAndFixEncoding(textParts.join(' ')),
          segments,
        };
      }).filter((cue) => cue.text);
      return [language, { format: 'normalized-json3', videoId, referenceLanguage, cues }];
    })
  );
}

// ─── Main Parser ────────────────────────────────────────────────

export function parseRawCaptionData(rawData: string): ParsedCaptionResult {
  if (!rawData || typeof rawData !== 'string') {
    return { format: 'unknown', cues: [] };
  }

  const trimmed = rawData.trim();

  if (trimmed.startsWith('{') && /"format"\s*:\s*"normalized-json3"/.test(trimmed)) {
    return parseNormalizedSubtitleData(trimmed);
  }

  // JSON3 detection: starts with { and contains "events"
  if (trimmed.startsWith('{') && /"events"\s*:/.test(trimmed)) {
    const cues = parseJson3(trimmed);
    if (cues.length > 0) return { format: 'json3', cues };
  }

  return { format: 'unknown', cues: [] };
}

export const SAMPLE_YOUTUBE_TIMEDTEXT_JSON3 = JSON.stringify({
  events: [
    {
      tStartMs: 500,
      dDurationMs: 3500,
      segs: [{ utf8: 'Hello and welcome to this video.' }],
    },
    {
      tStartMs: 4200,
      dDurationMs: 4000,
      segs: [{ utf8: 'Today we will talk about language learning.' }],
    },
    {
      tStartMs: 8500,
      dDurationMs: 3800,
      segs: [{ utf8: 'Subtitles help you follow along with the audio.' }],
    },
    {
      tStartMs: 12500,
      dDurationMs: 4200,
      segs: [{ utf8: "Let's get started with the first lesson." }],
    },
  ],
});
