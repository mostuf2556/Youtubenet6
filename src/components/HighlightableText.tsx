import React, { useMemo } from 'react';
import { isRtl } from '../utils/rtlUtils';
import { TTSSyncMode } from '../utils/appSettings';
import type { SubtitleSegment } from '../viewer/contracts';

interface HighlightableTextProps {
  text: string;
  isSpeaking: boolean;
  activeCharIndex: number | null;
  syncMode?: TTSSyncMode;
  segments?: SubtitleSegment[];
  currentTime?: number;
  cueStart?: number;
  className?: string;
  activeWordClassName?: string;
  pastWordClassName?: string;
  futureWordClassName?: string;
  dir?: 'rtl' | 'ltr' | 'auto';
  lang?: string;
}

interface Token {
  id: number;
  text: string;
  isWord: boolean;
  start: number;
  end: number;
}

export const HighlightableText: React.FC<HighlightableTextProps> = ({
  text,
  isSpeaking,
  activeCharIndex,
  syncMode = 'json3',
  segments = [],
  currentTime = 0,
  cueStart = 0,
  className = '',
  activeWordClassName = 'word-boundary-active font-bold px-2 py-0.5 rounded shadow-lg ring-2 ring-amber-400/80 scale-105 inline-block mx-0.5 transition-all duration-100',
  pastWordClassName = 'text-neutral-300 opacity-90',
  futureWordClassName = 'text-neutral-100',
  dir,
  lang,
}) => {
  const effectiveDir = dir || (isRtl(lang, text) ? 'rtl' : 'ltr');

  // Parse tokens (words and separators) with exact char ranges across Unicode scripts
  const tokens = useMemo<Token[]>(() => {
    if (!text) return [];
    const result: Token[] = [];
    // Unicode regex splits letters/numbers vs whitespace vs punctuation
    const regex = /(\s+|[^\s\p{L}\p{N}]+|[\p{L}\p{N}]+)/gu;
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;
      const isWord = /\S/.test(matchText) && !/^[.,!?;:"'()[\]{}<>«»„“—–]+$/.test(matchText);

      result.push({
        id: idx++,
        text: matchText,
        isWord,
        start,
        end,
      });
    }
    return result;
  }, [text]);

  // Select only from JSON3 segment timing or native word-boundary callbacks.
  const activeTokenIndex = useMemo<number>(() => {
    if (!isSpeaking || tokens.length === 0) {
      return -1;
    }
    if (syncMode === 'json3') {
      const relativeTime = currentTime - cueStart;
      const segmentIndex = segments.findIndex((segment, index) => {
        const nextOffset = segments[index + 1]?.offset;
        return relativeTime >= segment.offset && relativeTime < (nextOffset ?? Number.POSITIVE_INFINITY);
      });
      if (segmentIndex < 0) return -1;
      const segmentText = segments[segmentIndex]?.text || '';
      return tokens.findIndex((token) => token.isWord && text.indexOf(segmentText.trim()) >= token.start && text.indexOf(segmentText.trim()) < token.end);
    }
    if (activeCharIndex === null || activeCharIndex < 0) return -1;
    return tokens.findIndex((token) => token.isWord && activeCharIndex >= token.start && activeCharIndex < token.end);
  }, [tokens, isSpeaking, syncMode, segments, currentTime, cueStart, activeCharIndex, text]);

  if (!text) return null;

  if (!isSpeaking || activeTokenIndex === -1) {
    return (
      <span dir={effectiveDir} className={className}>
        {text}
      </span>
    );
  }

  return (
    <span
      dir={effectiveDir}
      className={`${className} inline`}
      data-testid="highlightable-text-container"
    >
      {tokens.map((token, i) => {
        if (!token.isWord) {
          return <span key={token.id}>{token.text}</span>;
        }

        const isActive = i === activeTokenIndex;
        const isPast = i < activeTokenIndex;

        return (
          <span
            key={token.id}
            data-testid={isActive ? 'active-tts-word-highlight' : undefined}
            className={
              isActive
                ? activeWordClassName
                : isPast
                ? pastWordClassName
                : futureWordClassName
            }
          >
            {token.text}
          </span>
        );
      })}
    </span>
  );
};
