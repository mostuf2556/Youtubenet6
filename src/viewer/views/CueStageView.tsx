import { formatTimecode, SubtitleViewProps } from '../contracts';

export function CueStageView({
  cues,
  activeCueId = null,
  translatedCues,
  showTranslation = true,
  showTimestamps = true,
  direction = 'auto',
  translationDirection = 'auto',
  onSelectCue,
}: SubtitleViewProps) {
  const index = cues.findIndex((cue) => cue.id === activeCueId);
  const active = index >= 0 ? cues[index] : cues[0];
  if (!active) return <div data-testid="cue-stage-empty" className="flex h-full items-center justify-center text-sm text-neutral-500">No cues injected.</div>;

  return (
    <div dir={direction} data-testid="cue-stage" className="flex h-full flex-col justify-center gap-4 p-6">
      <p className="truncate text-sm text-neutral-500/70">{index > 0 ? cues[index - 1].text : '—'}</p>
      <button type="button" data-cue-id={active.id} data-active onClick={() => onSelectCue?.(active)} className="rounded-xl border border-indigo-400/30 bg-neutral-900/60 p-5 text-start transition-colors hover:border-indigo-400/60">
        {showTimestamps && <span dir="ltr" className="font-mono text-[11px] tabular-nums text-indigo-300">{formatTimecode(active.start)} · {active.duration.toFixed(1)}s</span>}
        <span className="mt-2 block text-2xl font-semibold leading-tight text-neutral-100">{active.text}</span>
        {showTranslation && translatedCues?.[active.id] && <span dir={translationDirection} className="mt-3 block text-lg leading-snug text-indigo-300">{translatedCues[active.id]}</span>}
      </button>
      <p className="truncate text-sm text-neutral-500/70">{index >= 0 && index < cues.length - 1 ? cues[index + 1].text : '—'}</p>
    </div>
  );
}