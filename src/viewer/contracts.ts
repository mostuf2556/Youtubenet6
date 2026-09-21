export interface SubtitleCue {
  id: string;
  start: number;
  duration: number;
  text: string;
  segments?: SubtitleSegment[];
}

export interface SubtitleSegment {
  text: string;
  offset: number;
}

export interface SubtitleViewProps {
  cues: SubtitleCue[];
  activeCueId?: string | null;
  translatedCues?: Record<string, string>;
  showTranslation?: boolean;
  showTimestamps?: boolean;
  direction?: 'ltr' | 'rtl' | 'auto';
  translationDirection?: 'ltr' | 'rtl' | 'auto';
  onSelectCue?: (cue: SubtitleCue) => void;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName?: string;
  direction?: 'ltr' | 'rtl';
  enabled?: boolean;
  color?: string;
}

export interface LanguageViewProps {
  languages: LanguageOption[];
  selectedCode?: string | null;
  disabled?: boolean;
  onSelect: (code: string) => void;
  multiple?: boolean;
  selectedCodes?: string[];
  onChangeMultiple?: (codes: string[]) => void;
}

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  availableRates?: number[];
  captionsEnabled: boolean;
  theaterMode?: boolean;
  isBuffering?: boolean;
  disabled?: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onRateChange: (rate: number) => void;
  onToggleCaptions: () => void;
  onToggleTheater?: () => void;
}

export function formatTimecode(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`
    : `${pad(minutes)}:${pad(remainingSeconds)}`;
}