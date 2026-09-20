import React, { useState } from 'react';
import {
  Tv,
  FileText,
  Languages,
  Volume2,
  Activity,
  FolderHeart,
  Settings,
  Minimize2,
  Maximize2,
  ChevronDown,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

export type AppViewMode = 'video' | 'transcript' | 'parallel' | 'tts' | 'network' | 'library' | 'settings';

export interface ViewOption {
  id: AppViewMode;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

export const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'video',
    label: 'Video & Active Subtitles',
    shortLabel: 'Video',
    icon: Tv,
    description: 'Clean video player with dual-language subtitles overlay',
  },
  {
    id: 'transcript',
    label: 'Subtitle Transcript Table',
    shortLabel: 'Transcript',
    icon: FileText,
    description: 'Full subtitle cue list, search, and segment highlighting',
  },
  {
    id: 'parallel',
    label: 'Parallel Multi-Language Translations',
    shortLabel: 'Translations',
    icon: Languages,
    description: 'Multi-language translation cards & parallel alignments',
  },
  {
    id: 'tts',
    label: 'TTS Speech Queue & Voice Controls',
    shortLabel: 'TTS Voice',
    icon: Volume2,
    description: 'Text-to-speech stream, word timing boundaries, and rate',
  },
  {
    id: 'network',
    label: 'Network & TimedText Inspector',
    shortLabel: 'Network',
    icon: Activity,
    description: 'Live HTTP interception, tlang swapping, and hex previews',
  },
  {
    id: 'library',
    label: 'Video Library & Projects',
    shortLabel: 'Library',
    icon: FolderHeart,
    description: 'Saved YouTube videos and subtitle caches',
  },
  {
    id: 'settings',
    label: 'Settings & Preferences',
    shortLabel: 'Settings',
    icon: Settings,
    description: 'Subtitle positioning, methods, and OTA updates',
  },
];

interface ViewSelectorBarProps {
  activeView: AppViewMode;
  onSelectView: (view: AppViewMode) => void;
  minimizedViews: AppViewMode[];
  onToggleMinimize: (view: AppViewMode) => void;
  onRestoreView: (view: AppViewMode) => void;
  className?: string;
  isCompact?: boolean;
}

export const ViewSelectorBar: React.FC<ViewSelectorBarProps> = ({
  activeView,
  onSelectView,
  minimizedViews = [],
  onToggleMinimize,
  onRestoreView,
  className = '',
  isCompact = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeOption = VIEW_OPTIONS.find((v) => v.id === activeView) || VIEW_OPTIONS[0];
  const IconComponent = activeOption.icon;
  const isCurrentMinimized = minimizedViews.includes(activeView);

  return (
    <div
      id="app-view-selector-container"
      data-testid="app-view-selector-container"
      className={`relative w-full flex flex-col gap-1.5 ${className}`}
    >
      {/* Top Selector Ribbon */}
      <div className="flex items-center justify-between gap-2 bg-neutral-900/95 border border-neutral-800 backdrop-blur-md rounded-xl p-1.5 shadow-lg">
        {/* Main View Selection Dropdown / Button */}
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            id="view-selector-dropdown-btn"
            data-testid="view-selector-dropdown-btn"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-750 text-neutral-100 text-xs font-semibold border border-neutral-700/60 transition active:scale-[0.99]"
            title="Select which view to display"
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <IconComponent className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate font-medium text-xs sm:text-sm">
                View: <span className="text-white font-bold">{activeOption.label}</span>
              </span>
              {activeOption.badge && (
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-sky-950 border border-sky-600 text-sky-300 font-mono">
                  {activeOption.badge}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-sky-400' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu Modal */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div
                id="view-selector-dropdown-menu"
                data-testid="view-selector-dropdown-menu"
                className="absolute top-full left-0 mt-1.5 w-full sm:w-80 max-w-[95vw] z-50 bg-neutral-900/98 border border-neutral-700 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn"
              >
                <div className="px-2.5 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 flex items-center justify-between">
                  <span>Select Active App View</span>
                  <span className="text-[10px] text-sky-400 font-mono">7 Views Available</span>
                </div>
                <div className="max-h-72 overflow-y-auto flex flex-col gap-1 py-1">
                  {VIEW_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = opt.id === activeView;
                    const isMin = minimizedViews.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        id={`select-view-opt-${opt.id}`}
                        data-testid={`select-view-opt-${opt.id}`}
                        onClick={() => {
                          onSelectView(opt.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition ${
                          isSelected
                            ? 'bg-sky-600/20 border border-sky-500/80 text-white'
                            : 'hover:bg-neutral-800 text-neutral-300 border border-transparent'
                        }`}
                      >
                        <OptIcon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isSelected ? 'text-sky-400' : 'text-neutral-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold truncate">{opt.label}</span>
                            {isMin && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-amber-400 border border-amber-600/50">
                                Minimized
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate">{opt.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Controls: Minimize Current Panel Button */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            id="toggle-minimize-current-view-btn"
            data-testid="toggle-minimize-current-view-btn"
            onClick={() => onToggleMinimize(activeView)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
              isCurrentMinimized
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 hover:bg-amber-900'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white'
            }`}
            title={isCurrentMinimized ? 'Expand view panel' : 'Minimize this view panel'}
          >
            {isCurrentMinimized ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Restore</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline text-[11px]">Minimize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Minimized Views Tray / Dock (if any views are minimized) */}
      {minimizedViews.length > 0 && (
        <div
          id="minimized-views-tray"
          data-testid="minimized-views-tray"
          className="flex items-center gap-1.5 flex-wrap px-1 py-1"
        >
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Minimize2 className="w-3 h-3 text-amber-400" />
            Minimized:
          </span>
          {minimizedViews.map((vId) => {
            const opt = VIEW_OPTIONS.find((v) => v.id === vId);
            if (!opt) return null;
            const VIcon = opt.icon;

            return (
              <div
                key={vId}
                id={`minimized-chip-${vId}`}
                data-testid={`minimized-chip-${vId}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] shadow-sm hover:border-sky-500 transition"
              >
                <VIcon className="w-3 h-3 text-sky-400" />
                <button
                  type="button"
                  onClick={() => onRestoreView(vId)}
                  className="font-medium hover:text-white hover:underline cursor-pointer"
                  title={`Restore ${opt.label}`}
                >
                  {opt.shortLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onRestoreView(vId)}
                  className="p-0.5 text-neutral-400 hover:text-emerald-300"
                  title="Restore view"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
