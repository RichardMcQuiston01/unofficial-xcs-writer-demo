# CHANGELOG

## [Unreleased]

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
