import { ICON_VIEWBOX, iconToSvgPoints, type IconDefinition } from '../data/icons';

interface IconSelectorProps {
  readonly icons: readonly IconDefinition[];
  readonly selectedIconId: string;
  readonly onSelect: (iconId: string) => void;
}

export function IconSelector({ icons, selectedIconId, onSelect }: IconSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-slate-700">2. Choose an image</legend>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {icons.map((icon) => {
          const isSelected = icon.id === selectedIconId;
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => onSelect(icon.id)}
              aria-pressed={isSelected}
              title={icon.name}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-300 bg-white hover:border-indigo-400'
              }`}
            >
              <svg viewBox={ICON_VIEWBOX} className="h-12 w-12" aria-hidden="true">
                <polygon
                  points={iconToSvgPoints(icon)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={4}
                  className={isSelected ? 'text-indigo-600' : 'text-slate-600'}
                />
              </svg>
              <span className="text-xs text-slate-600">{icon.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
