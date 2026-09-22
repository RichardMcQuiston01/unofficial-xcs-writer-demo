/** Longest custom phrase the layout budget in `buildXsDocument.ts` reliably keeps centered on the canvas. */
const MAX_CUSTOM_PHRASE_LENGTH = 32;

interface PhraseSelectorProps {
  readonly phrases: readonly string[];
  readonly selectedPhrase: string;
  readonly onSelect: (phrase: string) => void;
}

export function PhraseSelector({ phrases, selectedPhrase, onSelect }: PhraseSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3">
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

      <div className="flex flex-col gap-1">
        <label htmlFor="custom-phrase" className="text-sm text-slate-600">
          Or type your own phrase
        </label>
        <input
          id="custom-phrase"
          type="text"
          value={selectedPhrase}
          onChange={(event) => onSelect(event.target.value)}
          maxLength={MAX_CUSTOM_PHRASE_LENGTH}
          placeholder="Type a custom phrase..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </fieldset>
  );
}
