import { useState, useRef, useCallback, useEffect, type RefObject } from 'react';
import { CaptionCue, TargetLanguage, SyncPlayOrder, YouTubePlayerHandle } from '../types';
import {
  speakText,
  stopTTS,
  unlockTTSAudio,
  getTTSEngineType,
  requestWakeLock,
  releaseWakeLock,
} from '../lib/ttsEngine';
import { logSync, logTTS } from '../utils/logBuffer';
import { loadAppSettings } from '../utils/appSettings';
import {
  getCachedJson3ForVideoAndLanguage,
  hasCachedJson3ForVideoAndLanguage,
} from '../../test/fixtures/defaultSubtitles';

export function findSegmentAtTime(segments: CaptionCue[], timeSec: number): number {
  if (!segments || segments.length === 0) return -1;
  return segments.findIndex((seg) => {
    const end = seg.start + (seg.duration || 2.5);
    return timeSec >= seg.start && timeSec < end;
  });
}

interface UseSyncEngineProps {
  cues: CaptionCue[];
  sourceLang?: string;
  languages: TargetLanguage[];
  playerRef: RefObject<YouTubePlayerHandle | null>;
  playOrder: SyncPlayOrder;
  observedUrl?: string | null;
  videoId?: string;
  externalTranslations?: Record<string, Record<string, string>>;
  enabled?: boolean;
}

export function useSyncEngine({
  cues,
  sourceLang = 'auto',
  languages,
  playerRef,
  playOrder,
  observedUrl,
  videoId,
  externalTranslations,
  enabled = true,
}: UseSyncEngineProps) {
  const [activeCueIndex, setActiveCueIndex] = useState<number>(-1);
  const [isSyncActive, setIsSyncActive] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentTTSLang, setCurrentTTSLang] = useState<string | null>(null);
  const [currentTTSText, setCurrentTTSText] = useState<string | null>(null);
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);
  const [isLoopingCue, setIsLoopingCue] = useState<boolean>(false);

  const isLoopingCueRef = useRef<boolean>(false);
  isLoopingCueRef.current = isLoopingCue;

  const toggleLoopCue = useCallback(() => {
    setIsLoopingCue((prev) => {
      const next = !prev;
      isLoopingCueRef.current = next;
      return next;
    });
  }, []);

  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(() => {
    const vId = videoId || 'L2Ryrr6txwA';
    const initialMap: Record<string, Record<string, string>> = {};
    const langs = ['ar', 'en', 'he', 'it', 'ru'];
    langs.forEach((l) => {
      const json3Cues = getCachedJson3ForVideoAndLanguage(vId, l);
      if (json3Cues) {
        json3Cues.forEach((c) => {
          if (c.id && c.text) {
            if (!initialMap[c.id]) initialMap[c.id] = {};
            initialMap[c.id][l] = c.text;
          }
        });
      }
    });
    return initialMap;
  });

  const abortRef = useRef<boolean>(false);
  const isActiveRef = useRef<boolean>(false);
  const isPlayingTTS = useRef<boolean>(false);

  const translationsRef = useRef(translations);
  translationsRef.current = translations;

  const languagesRef = useRef(languages);
  languagesRef.current = languages;

  const externalTranslationsRef = useRef(externalTranslations);
  externalTranslationsRef.current = externalTranslations;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
      stopTTS();
      releaseWakeLock();
    };
  }, []);

  // When target languages or settings change, stop any active TTS speech
  useEffect(() => {
    languagesRef.current = languages;
    if (isSpeaking) {
      stopTTS();
      setIsSpeaking(false);
      setActiveCharIndex(null);
      setCurrentTTSLang(null);
      setCurrentTTSText(null);
    }
  }, [languages]);

  /**
   * Helper to retrieve translation for a cue from native/table/fixture sources
   */
  const getCueTranslation = useCallback(
    async (cue: CaptionCue, targetLangCode: string): Promise<string> => {
      const cueId = cue.id;
      let cleanLang = targetLangCode.toLowerCase().split(/[-_]/)[0];
      if (cleanLang === 'iw' || cleanLang === 'il') cleanLang = 'he';
      const vId = videoId || 'L2Ryrr6txwA';

      // 1. Check external and local component translations
      const fromExt = externalTranslationsRef.current?.[cueId]?.[cleanLang] || externalTranslationsRef.current?.[cueId]?.[targetLangCode];
      if (fromExt && fromExt.trim().toLowerCase() !== cue.text.trim().toLowerCase()) {
        return fromExt;
      }

      const fromRef = translationsRef.current[cueId]?.[cleanLang] || translationsRef.current[cueId]?.[targetLangCode];
      if (fromRef && fromRef.trim().toLowerCase() !== cue.text.trim().toLowerCase()) {
        return fromRef;
      }

      // 2. Check local authentic fixture
      if (hasCachedJson3ForVideoAndLanguage(vId, cleanLang)) {
        const json3Cues = getCachedJson3ForVideoAndLanguage(vId, cleanLang);
        if (json3Cues && json3Cues.length > 0) {
          const match =
            json3Cues.find((c) => Math.abs(c.start - cue.start) < 0.75) ||
            json3Cues.find((c) => c.id === cueId);
          if (match && match.text) {
            return match.text;
          }
        }
      }

      return fromRef || fromExt || '';
    },
    [videoId]
  );

  /**
   * Play TTS for the active segment using reference implementation pattern
   */
  const playSegmentTTS = useCallback(
    async (segIndex: number) => {
      if (abortRef.current) return;
      unlockTTSAudio();
      isPlayingTTS.current = true;
      setIsSpeaking(true);

      const isSingleLang = loadAppSettings().singleTargetLanguageMode ?? true;
      let activeLangs = languagesRef.current.filter((l) => l.enabled);
      if (activeLangs.length === 0 && languagesRef.current.length > 0) {
        activeLangs = [languagesRef.current[0]];
      }
      const enabledLangs = isSingleLang ? activeLangs.slice(0, 1) : activeLangs;

      const cue = cues[segIndex];
      if (!cue) {
        isPlayingTTS.current = false;
        setIsSpeaking(false);
        return;
      }

      for (const lang of enabledLangs) {
        if (abortRef.current) break;
        setCurrentTTSLang(lang.code);

        let textToSpeak = await getCueTranslation(cue, lang.code);
        if (abortRef.current) break;
        if (!textToSpeak) textToSpeak = cue.text;
        if (!textToSpeak) continue;

        setCurrentTTSText(textToSpeak);
        setActiveCharIndex(0);

        logTTS(`[SyncEngine] TTS [${lang.code}] seg ${segIndex}: "${textToSpeak.slice(0, 60)}..."`);

        try {
          await speakText(textToSpeak, lang.code, lang.ttsRate, lang.voice, (charIdx) => {
            setActiveCharIndex(charIdx);
          });
        } catch (err: any) {
          console.warn(`TTS failed for ${lang.code}:`, err);
        }

        if (abortRef.current) break;
      }

      isPlayingTTS.current = false;
      setIsSpeaking(false);
      setCurrentTTSLang(null);
      setCurrentTTSText(null);
      setActiveCharIndex(null);
    },
    [cues, getCueTranslation]
  );

  /**
   * Start synchronization loop from a specific segment (reference startFromSegment)
   */
  const startFromSegment = useCallback(
    async (segIndex: number = 0) => {
      if (!cues?.length) {
        console.warn('Cannot start: no cues loaded');
        return;
      }

      unlockTTSAudio();
      abortRef.current = true;
      stopTTS();
      playerRef.current?.pause();
      await new Promise((r) => setTimeout(r, 200));

      abortRef.current = false;
      isActiveRef.current = true;
      setIsSyncActive(true);
      requestWakeLock();
      logSync('SyncLoop', `▶ Started from segment ${segIndex}`);

      let idx = segIndex >= 0 && segIndex < cues.length ? segIndex : 0;

      while (idx < cues.length && !abortRef.current) {
        const seg = cues[idx];
        const segEnd = seg.start + (seg.duration || 2.5);
        const cueDurationSec = seg.duration && seg.duration > 0 ? seg.duration : Math.max(1.5, segEnd - seg.start);
        const maxWaitMs = Math.max(2500, Math.min(30000, (cueDurationSec + 3.0) * 1000));
        setActiveCueIndex(idx);

        if (playOrder === 'tts_first') {
          // TTS first, then video
          logSync('SyncLoop', `Seg ${idx}: TTS first`);
          await playSegmentTTS(idx);
          if (abortRef.current) break;

          playerRef.current?.seekTo(seg.start);
          playerRef.current?.play();

          await new Promise<void>((resolve) => {
            const startTime = Date.now();
            const check = setInterval(() => {
              if (abortRef.current) {
                clearInterval(check);
                resolve();
                return;
              }
              const t = playerRef.current?.getCurrentTime?.() || 0;
              const elapsed = Date.now() - startTime;
              if (t >= segEnd - 0.15 || elapsed >= maxWaitMs) {
                clearInterval(check);
                resolve();
              }
            }, 100);
          });
          if (abortRef.current) break;
          playerRef.current?.pause();
        } else {
          // Video first (default)
          playerRef.current?.seekTo(seg.start);
          playerRef.current?.play();

          await new Promise<void>((resolve) => {
            const startTime = Date.now();
            const check = setInterval(() => {
              if (abortRef.current) {
                clearInterval(check);
                resolve();
                return;
              }
              const t = playerRef.current?.getCurrentTime?.() || 0;
              const elapsed = Date.now() - startTime;
              if (t >= segEnd - 0.15 || elapsed >= maxWaitMs) {
                clearInterval(check);
                resolve();
              }
            }, 100);
          });
          if (abortRef.current) break;
          playerRef.current?.pause();

          logSync('SyncLoop', `Seg ${idx}: video done, TTS starting`);
          await playSegmentTTS(idx);
          if (abortRef.current) break;
        }

        if (isLoopingCueRef.current) {
          // Loop current cue
        } else {
          idx++;
        }
      }

      if (!abortRef.current) {
        logSync('SyncLoop', '⏹ Playback complete');
      }
      isActiveRef.current = false;
      setIsSyncActive(false);
      releaseWakeLock();
    },
    [cues, playerRef, playSegmentTTS, playOrder, sourceLang]
  );

  /**
   * Handle YouTube state change events from iframe (reference handleYTStateChange)
   */
  const handleYTStateChange = useCallback(
    (state: number) => {
      // state 1 = PLAYING
      if (state === 1 && !isActiveRef.current && !isPlayingTTS.current && cues?.length && playerRef.current) {
        const time = playerRef.current?.getCurrentTime?.() || 0;
        let idx = findSegmentAtTime(cues, time);
        if (idx < 0) {
          idx = cues.findIndex((s) => s.start >= time);
          if (idx < 0) idx = 0;
        }
        startFromSegment(idx);
      }
    },
    [cues, playerRef, startFromSegment]
  );

  /**
   * Handle video time update events (reference handleTimeUpdate)
   * Only updates active cue when sync loop is NOT running to prevent desync during TTS
   */
  const handleTimeUpdate = useCallback(
    (time: number) => {
      if (isActiveRef.current || isPlayingTTS.current || !cues?.length) return;
      const idx = findSegmentAtTime(cues, time);
      if (idx >= 0 && idx !== activeCueIndex) {
        setActiveCueIndex(idx);
      }
    },
    [cues, activeCueIndex]
  );

  /**
   * Pauses the sync loop, stops TTS and firmly pauses video
   */
  const pauseSync = useCallback(() => {
    abortRef.current = true;
    stopTTS();
    playerRef.current?.pause();
    isActiveRef.current = false;
    setIsSyncActive(false);
    setIsSpeaking(false);
    setCurrentTTSLang(null);
    setCurrentTTSText(null);
    setActiveCharIndex(null);
    releaseWakeLock();
  }, [playerRef]);

  /**
   * Toggle between play and pause for the sync engine (reference togglePlayPause)
   */
  const togglePlayPause = useCallback(() => {
    if (isActiveRef.current) {
      pauseSync();
      logSync('SyncLoop', '⏸ Stopped');
    } else {
      startFromSegment(activeCueIndex >= 0 ? activeCueIndex : 0);
    }
  }, [activeCueIndex, startFromSegment, pauseSync]);

  /**
   * Go to specific segment / cue (reference goToSegment)
   */
  const goToSegment = useCallback(
    (idx: number) => {
      if (!cues || idx < 0 || idx >= cues.length) return;
      setActiveCueIndex(idx);
      if (isActiveRef.current) {
        startFromSegment(idx);
      } else {
        playerRef.current?.seekTo(cues[idx].start);
      }
    },
    [cues, startFromSegment, playerRef]
  );

  const jumpToCue = goToSegment;

  const goNext = useCallback(() => {
    const next = Math.min((activeCueIndex >= 0 ? activeCueIndex : 0) + 1, cues.length - 1);
    goToSegment(next);
  }, [activeCueIndex, cues.length, goToSegment]);

  const goPrev = useCallback(() => {
    const prev = Math.max((activeCueIndex >= 0 ? activeCueIndex : 0) - 1, 0);
    goToSegment(prev);
  }, [activeCueIndex, goToSegment]);

  const nextCue = goNext;
  const prevCue = goPrev;

  /**
   * Test-play TTS for a single target language without launching the video loop
   */
  const testSpeakLang = useCallback(
    async (cue: CaptionCue, lang: TargetLanguage, customText?: string) => {
      if (isSpeaking && currentTTSLang === lang.code) {
        stopTTS();
        setIsSpeaking(false);
        setActiveCharIndex(null);
        setCurrentTTSLang(null);
        setCurrentTTSText(null);
        return;
      }

      stopTTS();
      playerRef.current?.pause();
      await new Promise((r) => setTimeout(r, 120));

      let textToSpeak = customText;
      if (!textToSpeak) {
        textToSpeak = await getCueTranslation(cue, lang.code);
      }
      if (!textToSpeak) return;

      playerRef.current?.pause();
      setCurrentTTSLang(lang.code);
      setCurrentTTSText(textToSpeak);
      setActiveCharIndex(0);
      setIsSpeaking(true);
      try {
        await speakText(textToSpeak, lang.code, lang.ttsRate, lang.voice, (charIdx) => {
          setActiveCharIndex(charIdx);
        });
      } finally {
        setIsSpeaking(false);
        setActiveCharIndex(null);
        setCurrentTTSLang(null);
        setCurrentTTSText(null);
      }
    },
    [getCueTranslation, playerRef, isSpeaking, currentTTSLang]
  );

  /**
   * Directly speaks any single text string (e.g. original cue or translation)
   */
  const speakDirectText = useCallback(
    async (text: string, langCode: string = 'en', rate: number = 1.0, voice?: string) => {
      if (!text) return;
      unlockTTSAudio();

      if (isSpeaking && currentTTSText === text) {
        stopTTS();
        setIsSpeaking(false);
        setActiveCharIndex(null);
        setCurrentTTSLang(null);
        setCurrentTTSText(null);
        return;
      }

      stopTTS();
      playerRef.current?.pause();
      await new Promise((r) => setTimeout(r, 100));

      setCurrentTTSLang(langCode);
      setCurrentTTSText(text);
      setActiveCharIndex(0);
      setIsSpeaking(true);
      try {
        await speakText(text, langCode, rate, voice, (charIdx) => {
          setActiveCharIndex(charIdx);
        });
      } finally {
        setIsSpeaking(false);
        setActiveCharIndex(null);
        setCurrentTTSLang(null);
        setCurrentTTSText(null);
      }
    },
    [playerRef, isSpeaking, currentTTSText]
  );

  // Active mutual exclusion watchdog: whenever speaking is active, keep video paused
  useEffect(() => {
    if (isSpeaking) {
      playerRef.current?.pause();
    }
  }, [isSpeaking, playerRef]);

  return {
    activeCueIndex,
    isSyncActive,
    isSpeaking,
    currentTTSLang,
    currentTTSText,
    activeCharIndex,
    translations,
    ttsEngineType: getTTSEngineType(),
    startSync: startFromSegment,
    startFromSegment,
    pauseSync,
    togglePlayPause,
    isLoopingCue,
    toggleLoopCue,
    jumpToCue,
    goToSegment,
    nextCue,
    goNext,
    prevCue,
    goPrev,
    testSpeakLang,
    speakDirectText,
    getCueTranslation,
    handleYTStateChange,
    handleTimeUpdate,
  };
}
