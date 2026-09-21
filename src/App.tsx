import { useMemo, useState } from 'react';
import { DesignPreview } from './components/DesignPreview';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DonateCard } from './components/DonateCard';
import { IconSelector } from './components/IconSelector';
import { PhraseSelector } from './components/PhraseSelector';
import { ICONS } from './data/icons';
import { PHRASES } from './data/phrases';
import { buildXsDocument } from './lib/buildXsDocument';
import { downloadFile, slugify } from './lib/downloadFile';
import './donate-widget.css';

function App() {
  const [selectedPhrase, setSelectedPhrase] = useState<string>(PHRASES[0]);
  const [selectedIconId, setSelectedIconId] = useState<string>(ICONS[0].id);

  const selectedIcon = useMemo(
    () => ICONS.find((icon) => icon.id === selectedIconId) ?? ICONS[0],
    [selectedIconId],
  );

  function handleGenerate(): void {
    const xsBytes = buildXsDocument({ phrase: selectedPhrase, icon: selectedIcon });
    downloadFile(`${slugify(selectedPhrase)}.xs`, xsBytes, 'application/zip');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">XCS Writer Demo</h1>
        </header>

        <DisclaimerBanner />

        <p className="text-center text-slate-600">
          Pick a phrase and an image, then export an xTool Creative Space-ready{' '}
          <code className="rounded bg-slate-200 px-1 py-0.5">.xs</code> file — built with{' '}
          <a
            href="https://www.npmjs.com/package/@richardmcquiston01/unofficial-xcs-writer"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-indigo-600 hover:underline"
          >
            @richardmcquiston01/unofficial-xcs-writer
          </a>
          .
        </p>

        <PhraseSelector
          phrases={PHRASES}
          selectedPhrase={selectedPhrase}
          onSelect={setSelectedPhrase}
        />

        <IconSelector icons={ICONS} selectedIconId={selectedIconId} onSelect={setSelectedIconId} />

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-700">3. Preview</h2>
          <DesignPreview phrase={selectedPhrase} icon={selectedIcon} />
        </section>

        <button
          type="button"
          onClick={handleGenerate}
          className="self-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow transition-colors hover:bg-indigo-700"
        >
          Generate &amp; Download .xs
        </button>
      </div>

      <footer className="pb-8 text-center text-sm text-slate-500">
        &copy;2026 Richard McQuiston. All rights reserved.
      </footer>

      <DonateCard />
    </div>
  );
}

export default App;
