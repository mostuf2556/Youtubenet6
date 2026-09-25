import { LanguageViewProps } from '../contracts';

export function LanguageRailView({ languages, selectedCode = null, disabled = false, onSelect, label }: LanguageViewProps & { label?: string }) {
  return (
    <div data-testid="language-rail" role="listbox" className="flex flex-wrap items-center gap-2">
      {label && <span className="mr-1 text-[11px] uppercase tracking-widest text-neutral-500">{label}</span>}
      {languages.map((language) => {
        const isSelected = language.code === selectedCode;
        const isDisabled = disabled || language.enabled === false;
        return (
          <button key={language.code} type="button" role="option" aria-selected={isSelected} disabled={isDisabled} data-lang={language.code} onClick={() => onSelect(language.code)} className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isSelected ? 'border-indigo-400 bg-indigo-400/20 text-indigo-200' : 'border-neutral-700 bg-neutral-900/50 text-neutral-300 hover:border-indigo-400/50'}`}>
            <span>{language.name}</span>
            {language.nativeName && language.nativeName !== language.name && <span dir={language.direction ?? 'auto'} className="ms-2 text-xs text-neutral-500">{language.nativeName}</span>}
          </button>
        );
      })}
    </div>
  );
}