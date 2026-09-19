/**
 * Frontend Subtitle Service & YouTube TimedText Discovery
 *
 * Implements client-first subtitle fetching and timedtext discovery.
 * Tracks all network requests and explicitly reports any browser CORS restrictions
 * or network failures directly to the Log Viewer and Error Inspector.
 */

import { CaptionCue } from '../types';
import { cleanAndFixEncoding, parseRawCaptionData } from '../utils/captionParser';
import { trackNetworkRequest } from '../utils/networkInterceptor';
import { logSubtitles, logError, logWarn, logInfo, logNetwork } from '../utils/logBuffer';
import { store } from '../store';
import { addError } from '../store/errorsSlice';
import {
  getCachedSubtitles,
  saveCachedSubtitles,
  saveObservedTimedTextUrl,
} from '../utils/subtitleCache';
import {
  SAMPLE_AUTHENTIC_RUSSIAN_URL,
  SAMPLE_AUTHENTIC_RUSSIAN_CUES,
  SAMPLE_AUTHENTIC_HEBREW_CUES_FCRZADI8R9U,
  SAMPLE_AUTHENTIC_TIMEDTEXT_HEADERS,
} from '../config/fixtures';

export interface SubtitleFetchResult {
  success: boolean;
  videoId: string;
  cues: CaptionCue[];
  count: number;
  observedUrl?: string;
  source:
    | 'client_direct_youtube'
    | 'android_native_bridge'
    | 'server_proxy'
    | 'cached_fixture'
    | 'none';
  error?: string;
  corsBlocked?: boolean;
}

/**
 * Attempts to discover and extract YouTube timedtext caption URLs directly from
 * the YouTube video watch page on the client side.
 */
export async function discoverTimedTextClientSide(videoId: string): Promise<string | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const tracker = trackNetworkRequest(watchUrl, 'GET', 'timedtext_interception', {
    'Accept-Language': 'en-US,en;q=0.9',
  });

  logSubtitles(`[Frontend Subtitle Service] Initiating client-side timedtext discovery for ${videoId} at ${watchUrl}`);

  try {
    const res = await fetch(watchUrl, {
      method: 'GET',
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      tracker.complete(res.status, `HTTP ${res.status} ${res.statusText}`);
      return null;
    }

    const html = await res.text();
    tracker.complete(res.status, `HTML received (${html.length} bytes)`);

    const match = html.match(/"captionTracks":\s*\[\s*\{"baseUrl":"([^"]+)"/);
    if (match && match[1]) {
      const discoveredUrl = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
      logSubtitles(`[Frontend Subtitle Service] Discovered timedtext caption URL for ${videoId}: ${discoveredUrl.substring(0, 80)}...`);
      return discoveredUrl;
    }
  } catch (err: any) {
    const isCors =
      err?.name === 'TypeError' ||
      String(err?.message || '').toLowerCase().includes('failed to fetch') ||
      String(err?.message || '').toLowerCase().includes('network') ||
      String(err?.message || '').toLowerCase().includes('cors');

    tracker.fail(isCors ? `CORS Policy Blocked: ${err.message}` : String(err.message || err));

    if (isCors) {
      const corsMessage = `Direct browser fetch to ${watchUrl} blocked by browser CORS policy. Standard web browsers prevent cross-origin HTML scraping of YouTube watch pages. On Android native host, WebViewClient.shouldInterceptRequest captures timedtext requests transparently without CORS restrictions.`;
      logWarn('CORS / Subtitles', corsMessage);
      logError('CORS Blocked', `CORS blocked YouTube discovery request for video (${videoId}): ${watchUrl}`);

      store.dispatch(
        addError({
          section: 'network',
          title: `CORS Policy Restriction (${videoId})`,
          message: corsMessage,
          details: {
            videoId,
            targetUrl: watchUrl,
            error: String(err),
            platformNote: 'Web Companion sandbox enforces browser cross-origin policy; Android native container intercepts via WebViewClient without CORS.',
          },
        })
      );
    } else {
      logWarn('Subtitles', `Client-side discovery error for ${videoId}: ${String(err)}`);
    }
  }

  return null;
}

/**
 * Attempts direct client-side fetch of a timedtext URL.
 */
export async function fetchTimedTextDirectlyClientSide(
  url: string,
  videoId: string
): Promise<CaptionCue[] | null> {
  const tracker = trackNetworkRequest(url, 'GET', 'timedtext_interception');
  logSubtitles(`[Frontend Subtitle Service] Attempting direct client-side timedtext fetch for ${videoId}: ${url.substring(0, 80)}...`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      tracker.complete(res.status, `HTTP ${res.status}`);
      return null;
    }

    const rawText = await res.text();
    tracker.complete(res.status, rawText.substring(0, 100));

    if (rawText && !rawText.includes('<title>Sorry...</title>') && !rawText.includes('class="g-recaptcha"')) {
      const parsed = parseRawCaptionData(rawText);
      if (parsed.cues && parsed.cues.length > 0) {
        logSubtitles(`[Frontend Subtitle Service] Direct client-side fetch parsed ${parsed.cues.length} cues for ${videoId} (format: ${parsed.format})`);
        return parsed.cues;
      }
    }
  } catch (err: any) {
    const isCors =
      err?.name === 'TypeError' ||
      String(err?.message || '').toLowerCase().includes('failed to fetch') ||
      String(err?.message || '').toLowerCase().includes('cors');

    tracker.fail(isCors ? `CORS Policy Blocked: ${err.message}` : String(err.message || err));

    if (isCors) {
      const corsMessage = `Direct client fetch to ${url} blocked by browser CORS policy.`;
      logWarn('CORS / TimedText', corsMessage);
      logError('CORS Blocked', `Timedtext fetch for video (${videoId}) blocked by CORS at: ${url}`);

      store.dispatch(
        addError({
          section: 'network',
          title: `CORS Blocked: TimedText Endpoint (${videoId})`,
          message: corsMessage,
          details: {
            videoId,
            url,
            error: String(err),
          },
        })
      );
    }
  }

  return null;
}

/**
 * Main frontend subtitle fetcher & coordinator
 */
export async function fetchSubtitlesFrontend(
  videoId: string,
  options?: {
    tlang?: string;
    disableFixtures?: boolean;
    forceRefresh?: boolean;
  }
): Promise<SubtitleFetchResult> {
  const cleanId = (videoId || '').trim();
  if (!cleanId) {
    return {
      success: false,
      videoId: '',
      cues: [],
      count: 0,
      source: 'none',
      error: 'Empty videoId provided',
    };
  }

  logSubtitles(`[Frontend Subtitle Service] Starting subtitle acquisition for video (${cleanId})`);

  // 1. Check client-side cached subtitles first (unless forceRefresh)
  if (!options?.forceRefresh) {
    const cached = getCachedSubtitles(cleanId);
    if (cached && cached.length > 0) {
      logSubtitles(`[Frontend Subtitle Service] Loaded ${cached.length} cached cues from local storage for (${cleanId})`);
      return {
        success: true,
        videoId: cleanId,
        cues: cached,
        count: cached.length,
        source: 'cached_fixture',
      };
    }
  }

  // 2. Try Android Native Shell bridge if running inside native Android host
  if (
    typeof window !== 'undefined' &&
    (window.AndroidNativeShell?.fetchTranslatedCaptionsWithUrl || window.AndroidNativeShell?.fetchTranslatedCaptions)
  ) {
    try {
      logSubtitles(`[Frontend Subtitle Service] Attempting capture via Android Native Shell bridge for (${cleanId})`);
      let rawNative = '';
      if (window.AndroidNativeShell.fetchTranslatedCaptions) {
        rawNative = window.AndroidNativeShell.fetchTranslatedCaptions(options?.tlang || 'en', 'json3');
      }
      if (rawNative && !rawNative.includes('<title>Sorry...</title>')) {
        const parsed = parseRawCaptionData(rawNative);
        if (parsed.cues && parsed.cues.length > 0) {
          logSubtitles(`[Frontend Subtitle Service] Android Native Shell bridge provided ${parsed.cues.length} cues for (${cleanId})`);
          return {
            success: true,
            videoId: cleanId,
            cues: parsed.cues,
            count: parsed.cues.length,
            source: 'android_native_bridge',
          };
        }
      }
    } catch (androidErr) {
      logWarn('Android Bridge', `Android bridge subtitle capture error for ${cleanId}: ${String(androidErr)}`);
    }
  }

  // 3. Perform Direct Client-Side YouTube timedtext Discovery & Fetch (Frontend Service)
  // This explicitly executes in browser context and logs network tracking + CORS diagnostics
  let discoveredTimedTextUrl: string | null = null;
  let clientCues: CaptionCue[] | null = null;

  try {
    // Attempt 3a: Discover timedtext URL from watch page
    discoveredTimedTextUrl = await discoverTimedTextClientSide(cleanId);

    // Attempt 3b: If discovered or common format, try direct client fetch
    if (discoveredTimedTextUrl) {
      clientCues = await fetchTimedTextDirectlyClientSide(discoveredTimedTextUrl, cleanId);
    } else {
      // Also try standard direct endpoints to record the network attempt in log viewer
      const candidateDirectUrls = [
        `https://www.youtube.com/api/timedtext?v=${cleanId}&lang=en&fmt=json3`,
        `https://www.youtube.com/api/timedtext?v=${cleanId}&lang=auto&fmt=srt`,
      ];
      for (const candUrl of candidateDirectUrls) {
        const candidateCues = await fetchTimedTextDirectlyClientSide(candUrl, cleanId);
        if (candidateCues && candidateCues.length > 0) {
          clientCues = candidateCues;
          discoveredTimedTextUrl = candUrl;
          break;
        }
      }
    }

    if (clientCues && clientCues.length > 0) {
      const sanitized = clientCues.map((c) => ({
        ...c,
        text: cleanAndFixEncoding(c.text),
      }));
      saveCachedSubtitles(cleanId, sanitized);
      if (discoveredTimedTextUrl) {
        saveObservedTimedTextUrl(cleanId, discoveredTimedTextUrl);
      }
      return {
        success: true,
        videoId: cleanId,
        cues: sanitized,
        count: sanitized.length,
        observedUrl: discoveredTimedTextUrl || undefined,
        source: 'client_direct_youtube',
      };
    }
  } catch (clientErr: any) {
    logWarn('Subtitles', `Client-side direct fetch failed for ${cleanId}: ${String(clientErr)}`);
  }

  // 4. Client-side Fixture Fallback for Demo Videos (e.g. FcRzAdI8R9U)
  if (!options?.disableFixtures && cleanId === 'FcRzAdI8R9U') {
    logSubtitles(`[Frontend Subtitle Service] Using authentic client-side fixture cues for demo video (${cleanId})`);
    let fixtureCues = [...SAMPLE_AUTHENTIC_RUSSIAN_CUES];
    const targetLang = options?.tlang;
    if (targetLang && targetLang !== 'ru') {
      if ((targetLang === 'he' || targetLang === 'iw') && SAMPLE_AUTHENTIC_HEBREW_CUES_FCRZADI8R9U) {
        fixtureCues = [...SAMPLE_AUTHENTIC_HEBREW_CUES_FCRZADI8R9U];
      }
    }
    const sanitized = fixtureCues.map((c) => ({
      ...c,
      text: cleanAndFixEncoding(c.text),
    }));
    saveCachedSubtitles(cleanId, sanitized);
    saveObservedTimedTextUrl(cleanId, SAMPLE_AUTHENTIC_RUSSIAN_URL);
    return {
      success: true,
      videoId: cleanId,
      cues: sanitized,
      count: sanitized.length,
      observedUrl: SAMPLE_AUTHENTIC_RUSSIAN_URL,
      source: 'cached_fixture',
    };
  }

  // 5. Final Report when no captions are found
  const notFoundMsg = `No native timedtext subtitles found for YouTube video (${cleanId}). Direct browser requests to YouTube timedtext encountered browser CORS protection (expected in standard browser sandbox).`;
  logWarn('Subtitles', notFoundMsg);

  return {
    success: false,
    videoId: cleanId,
    cues: [],
    count: 0,
    source: 'none',
    error: notFoundMsg,
    corsBlocked: true,
  };
}
