import { useEffect, useRef } from 'react';
import { formatTimecode, SubtitleViewProps } from '../contracts';

export function TranscriptDeckView({
  cues,
  activeCueId = null,
  translatedCues,
  showTranslation = false,
  showTimestamps = true,
  direction = 'auto',
  translationDirection = 'auto',
  onSelectCue,
}: SubtitleViewProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!activeCueId || !listRef.current) return;
    listRef.current.querySelector<HTMLElement>(`[data-cue-id="${activeCueId}"]`)?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }, [activeCueId]);

  if (cues.length === 0) {
    return <p data-testid="transcript-empty" className="p-6 text-sm text-neutral-500">No cues injected.</p>;
  }

  return (
    <ul ref={listRef} dir={direction} data-testid="transcript-deck" className="h-full space-y-1 overflow-y-auto p-3">
      {cues.map((cue) => {
        const isActive = cue.id === activeCueId;
        const translation = translatedCues?.[cue.id];
        return (
          <li key={cue.id} data-cue-id={cue.id}>
            <button
              type="button"
              aria-current={isActive || undefined}
              data-active={isActive || undefined}
              onClick={() => onSelectCue?.(cue)}
              className={`group flex w-full gap-3 rounded-lg px-3 py-2 text-start transition-colors ${
                isActive ? 'bg-indigo-500/15 shadow-[inset_2px_0_0_0_rgb(129,140,248)]' : 'hover:bg-neutral-800/60'
              }`}
            >
              {showTimestamps && (
                <span dir="ltr" className={`mt-0.5 shrink-0 font-mono text-[11px] tabular-nums ${isActive ? 'text-indigo-300' : 'text-neutral-500'}`}>
                  {formatTimecode(cue.start)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className={`block text-[15px] leading-snug ${isActive ? 'font-semibold text-neutral-100' : 'text-neutral-300'}`}>
                  {cue.text}
                </span>
                {showTranslation && translation && (
                  <span dir={translationDirection} className="mt-1 block text-[13px] leading-snug text-indigo-300">
                    {translation}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}