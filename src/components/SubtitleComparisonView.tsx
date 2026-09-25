import React from 'react';
import { CaptionCue } from '../types';
import { formatTimestamp } from '../utils/captionParser';

interface SubtitleComparisonViewProps {
  tracks: Array<{
    code: string;
    label: string;
    originalCues: CaptionCue[];
    normalizedCues: CaptionCue[];
  }>;
  currentTime: number;
  onSeek?: (seconds: number) => void;
}

function findActiveCue(cues: CaptionCue[], currentTime: number): CaptionCue | null {
  return cues.find((cue) => currentTime >= cue.start && currentTime < cue.start + cue.duration) || null;
}

function CueColumn({ title, tracks, normalized, currentTime, onSeek }: {
  title: string;
  tracks: SubtitleComparisonViewProps['tracks'];
  normalized: boolean;
  currentTime: number;
  onSeek?: (seconds: number) => void;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-neutral-700/70 bg-neutral-950/70 p-3">
      <h3 className="mb-2 border-b border-neutral-800 pb-2 text-xs font-bold uppercase tracking-wide text-neutral-200">{title}</h3>
      <div className="space-y-2">
        {tracks.map((track) => {
          const cue = findActiveCue(normalized ? track.normalizedCues : track.originalCues, currentTime);
          return (
            <div key={track.code} className="rounded-md border border-neutral-800 bg-neutral-900/80 p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{track.label}</span>
                {cue && (
                  <button
                    type="button"
                    onClick={() => onSeek?.(cue.start)}
                    className="font-mono text-[10px] text-neutral-500 hover:text-amber-300"
                    title="Seek to this subtitle"
                  >
                    {formatTimestamp(cue.start)}
                  </button>
                )}
              </div>
              <p className="min-h-10 text-sm leading-5 text-neutral-100">{cue?.text || 'No subtitle at this time'}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SubtitleComparisonView({ tracks, currentTime, onSeek }: SubtitleComparisonViewProps) {
  return (
    <section
      id="subtitle-comparison-view"
      data-testid="subtitle-comparison-view"
      className="rounded-xl border border-neutral-800 bg-neutral-900/85 p-3 shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-100">Subtitle comparison</h2>
          <p className="text-[11px] text-neutral-400">Activated languages follow the same playback position.</p>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-neutral-500">{formatTimestamp(currentTime)}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CueColumn title="Original" tracks={tracks} normalized={false} currentTime={currentTime} onSeek={onSeek} />
        <CueColumn title="Normalized" tracks={tracks} normalized currentTime={currentTime} onSeek={onSeek} />
      </div>
    </section>
  );
}
