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

### Known limitations

- v0.6.0's `.xs` generation doesn't yet write Cut/Engrave process profiles
  or device bindings (no `addProfile`-style API exists in the package
  yet), so power/speed/mode still need to be set manually per shape in
  xTool Creative Space after import. This note will be removed once that
  support lands upstream and this demo adopts it.

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
