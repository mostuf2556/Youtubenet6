import { Captions, Maximize2, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { MouseEvent } from 'react';
import { formatTimecode, PlaybackControlsProps } from '../contracts';

const DEFAULT_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function ControlRibbonView({ isPlaying, currentTime, duration, playbackRate, availableRates = DEFAULT_RATES, captionsEnabled, theaterMode = false, isBuffering = false, disabled = false, onTogglePlay, onSeek, onRateChange, onToggleCaptions, onToggleTheater }: PlaybackControlsProps) {
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const seekFromEvent = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled || duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onSeek(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * duration);
  };

  return (
    <div data-testid="control-ribbon" className="space-y-3 border-y border-neutral-800 p-4">
      <div role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(currentTime)} tabIndex={0} onClick={seekFromEvent} className="group h-2 w-full cursor-pointer rounded-full bg-neutral-800">
        <div className="relative h-2 rounded-full bg-indigo-400 transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label={isPlaying ? 'Pause' : 'Play'} disabled={disabled} onClick={onTogglePlay} className="inline-flex size-11 items-center justify-center rounded-full bg-indigo-400 text-neutral-950 transition-opacity hover:opacity-90 disabled:opacity-40">{isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}</button>
        <button type="button" aria-label="Back 10 seconds" disabled={disabled} onClick={() => onSeek(Math.max(0, currentTime - 10))} className="inline-flex size-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 hover:border-indigo-400/60"><RotateCcw className="size-4" /></button>
        <button type="button" aria-label="Forward 10 seconds" disabled={disabled} onClick={() => onSeek(Math.min(duration, currentTime + 10))} className="inline-flex size-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 hover:border-indigo-400/60"><RotateCw className="size-4" /></button>
        <span dir="ltr" className="ms-1 font-mono text-sm tabular-nums text-neutral-500">{formatTimecode(currentTime)} / {formatTimecode(duration)}{isBuffering && <span className="ms-2 text-indigo-300">buffering...</span>}</span>
        <div className="ms-auto flex items-center gap-2">
          <select aria-label="Playback speed" disabled={disabled} value={playbackRate} onChange={(event) => onRateChange(Number(event.target.value))} className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 font-mono text-sm text-neutral-200">{availableRates.map((rate) => <option key={rate} value={rate}>{rate}x</option>)}</select>
          <button type="button" aria-label="Toggle captions" aria-pressed={captionsEnabled} onClick={onToggleCaptions} className={`inline-flex size-10 items-center justify-center rounded-md border ${captionsEnabled ? 'border-indigo-400 bg-indigo-400/20 text-indigo-300' : 'border-neutral-700 text-neutral-500'}`}><Captions className="size-4" /></button>
          {onToggleTheater && <button type="button" aria-label="Toggle theater mode" aria-pressed={theaterMode} onClick={onToggleTheater} className={`inline-flex size-10 items-center justify-center rounded-md border ${theaterMode ? 'border-indigo-400 bg-indigo-400/20 text-indigo-300' : 'border-neutral-700 text-neutral-500'}`}><Maximize2 className="size-4" /></button>}
        </div>
      </div>
    </div>
  );
}