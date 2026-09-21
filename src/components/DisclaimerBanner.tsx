import { useState } from 'react';

export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 pr-10 text-sm text-amber-900">
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss disclaimer"
        className="absolute right-2 top-2 rounded px-1.5 text-amber-700 hover:bg-amber-100"
      >
        &times;
      </button>
      This is an unofficial, independently developed demo and is not affiliated with, endorsed
      by, or supported by xTool. xTool Creative Space is a trademark of its respective owner.
    </div>
  );
}
