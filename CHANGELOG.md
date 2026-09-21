# CHANGELOG

## [Unreleased]

### Changed

- Stage 7: switched the demo's generated output from the legacy `.xcs`
  format to `.xs` (xTool Studio v1.7+'s current ZIP-based project format).
  Bumped `@richardmcquiston01/unofficial-xcs-writer` to `^0.6.0`, which adds
  building an `.xs` project from scratch (`XCSGenerator.toXsBytes()`).
  `src/lib/buildXcsDocument.ts` is now `src/lib/buildXsDocument.ts`; the
  **Generate & Download** button now produces a `<slug>.xs` file instead of
  `<slug>.xcs`. Layout, centering, and layer-assignment logic is unchanged.

- Stage 8: `.xs` files now carry real Cut/Engrave profiles and device
  bindings. Real-world testing found that a Stage 7 file couldn't just be
  pre-set to Cut/Engrave — it couldn't be manually assigned either, since
  `unofficial-xcs-writer` 0.6.0 writes an empty `profiles.json` and empty
  device bindings, leaving xTool Creative Space with nothing to offer in
  its dropdown. `src/lib/xsProfiles.ts` now patches a generated archive
  after the fact with a default Cut profile bound to the icon and a
  default Engrave profile bound to the phrase, matching the schema of a
  real xTool-authored `.xs` file. `fflate` moved from a dev-only
  dependency to a real one since this patch step runs in the browser.
  Verified against the real xTool Creative Space application via "Open
  Project": the file opens with the correct target device selected and
  the icon/text already assigned a Cut/Engrave profile (freely
  reassignable), resolving the known limitation from Stage 6/7.

### Known limitations

- The Cut/Engrave profiles Stage 8 injects use conservative placeholder
  power/speed values, not settings tuned to any material — they exist so
  the profiles are assignable and editable in xTool Creative Space, not as
  ready-to-cut settings.
- This is a demo-side workaround for a gap in
  `@richardmcquiston01/unofficial-xcs-writer` 0.6.0 (no `addProfile`-style
  API yet); once the package adds real profile/binding support, this patch
  step should be revisited in favor of it.

## [1.0.0] - 2026-09-20

### Added

- `ROADMAP.md` outlining the staged development plan (scaffolding, shared
  data, selection UI, XCS document builder, app wiring, styling/polish, and
  QA/deployment) and the `dev` → `staging` → `main` branching workflow.
- Stage 0 project scaffolding: Vite + React 19 + TypeScript SPA, Tailwind
  CSS v4, `oxlint`, `vercel.json`, and the
  `@richardmcquiston01/unofficial-xcs-writer` dependency.
- Stage 1 shared data: preset phrase list (`src/data/phrases.ts`) and the
  built-in icon set (`src/data/icons.ts`) with helpers for both the
  on-screen SVG preview and an `XCSGenerator.addPath`-ready SVG path `d`
  string.
- Stage 2 selection & preview UI: `PhraseSelector`, `IconSelector`,
  `DesignPreview`, and `DisclaimerBanner` components (not yet wired into
  `App.tsx` — that's Stage 4).
- Stage 3 `.xcs` document builder: `src/lib/buildXcsDocument.ts` composes a
  phrase and icon into an xTool Creative Space-ready project (icon cut path
  on the default layer, engraved phrase as real glyph text on a separate
  layer), plus a Vitest suite (`npm test`) covering canvas bounds,
  centering, layer assignment, and round-tripping through
  `assertXcsFormat`.
- Stage 4 download & app wiring: `src/lib/downloadFile.ts` (binary-safe
  download helper + `slugify`) and a fully wired `App.tsx` — pick a phrase
  and icon, preview the combined design, and click **Generate & Download
  .xcs** to download a real xTool Creative Space project file.
- Stage 5 polish: floating `DonateCard` (dismissible, persists via
  `localStorage`) wired into `App.tsx` alongside `donate-widget.css` and
  `public/donate.svg`; verified the existing `donate.svg` QR decodes to the
  correct Stripe URL. Confirmed keyboard navigation, focus states, and
  `aria-pressed`/`aria-label` coverage match the reference demo.
- Stage 6 QA & release: full `npm run lint` / `npm run build` / `npm test`
  pass on the final `dev` tip. Generated and validated a real `.xcs` file
  (via the deployed browser flow + `assertXcsFormat`) for every preset
  phrase/icon combination.

### Known limitations

- Rendering inside the actual xTool Creative Space application has not
  been verified by an automated agent (no access to that software) —
  generated `.xcs` files pass the package's own format validator and were
  spot-checked structurally, but a human should confirm the icon cuts and
  phrase engraves as expected before relying on this for real hardware.
