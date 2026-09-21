import type { CaptionCue } from '../../../src/types';
import { parseNormalizedSubtitleData } from '../../../src/utils/captionParser';

import arJsonRaw from './ar.json?raw';
import enJsonRaw from './en.json?raw';
import heJsonRaw from './he.json?raw';
import itJsonRaw from './it.json?raw';
import ruJsonRaw from './ru.json?raw';

const rawMap: Record<string, string> = {
  ar: arJsonRaw || '',
  en: enJsonRaw || '',
  he: heJsonRaw || '',
  it: itJsonRaw || '',
  ru: ruJsonRaw || '',
};

export const L2RYRR6TXWA_NORMALIZED_TRACKS: Record<string, CaptionCue[]> = Object.fromEntries(
  Object.entries(rawMap).map(([language, raw]) => [language, parseNormalizedSubtitleData(raw).cues])
);

export function getNormalizedSubtitlesForLanguage(language: string): CaptionCue[] | null {
  const clean = (language || '').toLowerCase().trim().split(/[-_]/)[0];
  const normalized = clean === 'iw' || clean === 'il' ? 'he' : clean;
  return L2RYRR6TXWA_NORMALIZED_TRACKS[normalized] || null;
}