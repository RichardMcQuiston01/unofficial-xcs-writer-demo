import { ICON_VIEWBOX, iconToSvgPoints, type IconDefinition } from '../data/icons';

interface DesignPreviewProps {
  readonly phrase: string;
  readonly icon: IconDefinition;
}

export function DesignPreview({ phrase, icon }: DesignPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <svg viewBox={ICON_VIEWBOX} className="h-40 w-40 text-slate-800" aria-hidden="true">
        <polygon
          points={iconToSvgPoints(icon)}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        />
      </svg>
      <p className="text-center text-xl font-medium tracking-wide text-slate-800">{phrase}</p>
    </div>
  );
}
