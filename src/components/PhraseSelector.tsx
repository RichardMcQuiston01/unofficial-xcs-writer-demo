interface PhraseSelectorProps {
  readonly phrases: readonly string[];
  readonly selectedPhrase: string;
  readonly onSelect: (phrase: string) => void;
}

export function PhraseSelector({ phrases, selectedPhrase, onSelect }: PhraseSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-slate-700">1. Choose a phrase</legend>
      <div className="flex flex-wrap gap-2">
        {phrases.map((phrase) => {
          const isSelected = phrase === selectedPhrase;
          return (
            <button
              key={phrase}
              type="button"
              onClick={() => onSelect(phrase)}
              aria-pressed={isSelected}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {phrase}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
