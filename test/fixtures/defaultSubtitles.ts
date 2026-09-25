import { CaptionCue } from '../../src/types';
import { parseRawCaptionData } from '../../src/utils/captionParser';
import { L2RYRR6TXWA_LANGUAGE_JSON3_TRACKS } from './L2Ryrr6txwA/jsonStrings';
import { EILFKSGNKDA_LANGUAGE_TRACKS } from './eilfksgnkda';
import { L2RYRR6TXWA_NORMALIZED_TRACKS } from './L2Ryrr6txwA_normalized/jsonStrings';

export type SubtitleFixtureSource = 'raw' | 'normalized';

export const DEFAULT_MOCKED_SUBTITLES: Record<string, CaptionCue[]> = {
  L2Ryrr6txwA: L2RYRR6TXWA_LANGUAGE_JSON3_TRACKS.en,
  EILFkSGNkdA: EILFKSGNKDA_LANGUAGE_TRACKS.en,
};

export { L2RYRR6TXWA_LANGUAGE_JSON3_TRACKS };

export function getFixtureSubtitlesForVideo(videoId: string, langCode = 'en', source: SubtitleFixtureSource = 'raw'): CaptionCue[] {
  if (videoId === 'L2Ryrr6txwA') {
    const clean = (langCode || '').toLowerCase().split(/[-_]/)[0];
    const normalized = clean === 'iw' || clean === 'il' ? 'he' : clean;
    const tracks = source === 'normalized' ? L2RYRR6TXWA_NORMALIZED_TRACKS : L2RYRR6TXWA_LANGUAGE_JSON3_TRACKS;
    return tracks[normalized] || [];
  }
  return getMockedSubtitlesForVideo(videoId);
}

export function getMockedSubtitlesForVideo(videoId: string): CaptionCue[] {
  if (videoId === 'L2Ryrr6txwA') {
    return L2RYRR6TXWA_LANGUAGE_JSON3_TRACKS.en;
  }
  if (videoId === 'EILFkSGNkdA') {
    return EILFKSGNKDA_LANGUAGE_TRACKS.en;
  }
  if (DEFAULT_MOCKED_SUBTITLES[videoId]) {
    return DEFAULT_MOCKED_SUBTITLES[videoId];
  }
  return [];
}

export function getCachedJson3ForVideoAndLanguage(videoId: string, langCode: string): CaptionCue[] | null {
  if (videoId === 'L2Ryrr6txwA') {
    let clean = (langCode || '').toLowerCase().split(/[-_]/)[0];
    if (clean === 'iw' || clean === 'il') clean = 'he';
    return L2RYRR6TXWA_LANGUAGE_JSON3_TRACKS[clean] || null;
  }
  if (videoId === 'EILFkSGNkdA') {
    let clean = (langCode || '').toLowerCase().split(/[-_]/)[0];
    if (clean === 'iw' || clean === 'il') clean = 'he';
    return EILFKSGNKDA_LANGUAGE_TRACKS[clean] || null;
  }
  return null;
}

export function hasCachedJson3ForVideoAndLanguage(videoId: string, langCode: string): boolean {
  if (videoId === 'L2Ryrr6txwA') {
    let clean = (langCode || '').toLowerCase().split(/[-_]/)[0];
    if (clean === 'iw' || clean === 'il') clean = 'he';
    return !!L2RYRR6TXWA_LANGUAGE_JSON3_TRACKS[clean];
  }
  if (videoId === 'EILFkSGNkdA') {
    let clean = (langCode || '').toLowerCase().split(/[-_]/)[0];
    if (clean === 'iw' || clean === 'il') clean = 'he';
    return !!EILFKSGNKDA_LANGUAGE_TRACKS[clean];
  }
  return false;
}

export function getAllCachedLanguageCodesForVideo(videoId: string): string[] {
  if (!videoId) return [];
  if (videoId === 'L2Ryrr6txwA') {
    return ['en', 'ru', 'he', 'it', 'ar'];
  }
  if (videoId === 'EILFkSGNkdA') {
    return ['en', 'he', 'iw'];
  }
  return [];
}

