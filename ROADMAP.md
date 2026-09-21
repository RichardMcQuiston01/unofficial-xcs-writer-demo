# Roadmap

This roadmap tracks development of the Unofficial XCS Writer Demo. The demo
replicates the functionality of
[unofficial-lb-writer-demo](https://github.com/RichardMcQuiston01/unofficial-lb-writer-demo)
(phrase + icon picker → generated laser project file), but targets the
**xTool Creative Space `.xcs` format** via
[`@richardmcquiston01/unofficial-xcs-writer`](https://www.npmjs.com/package/@richardmcquiston01/unofficial-xcs-writer)
instead of LightBurn's `.lbrn2`.

## Key differences from the LightBurn demo

- `.xcs` is a UTF-8 JSON document (canvas/layer/display objects), not XML —
  the builder API and output format differ from `buildLbrn2Document.ts`.
- Vector icons are supplied to `addPath` as an SVG path `d` string plus
  `x, y, width, height`, not a flat point array — icon data needs an SVG
  path string per shape (in addition to the polygon points used for the
  on-screen `<svg><polygon>` preview).
- Text needs real glyph outlines (`loadDefaultFont` + `layoutGlyphText` /
  `layoutCurvedGlyphText`) for xTool Creative Space to render it; there is
  no "just pass a string" text mode.
- `project.toBytes()` returns a `Uint8Array`, so the download helper needs a
  binary-safe `Blob` (`application/json` or `application/octet-stream`),
  not the text/XML download used for `.lbrn2`.
- The disclaimer banner and copy should reference **xTool / xTool Creative
  Space** (this is an unofficial, independently developed demo, not
  affiliated with or endorsed by xTool).

## Branching & release workflow

- All feature work happens on a feature branch cut from `dev`
  (e.g. `feature/<stage-name>`).
- Each stage below is completed on its own feature branch and merged back
  into `dev` via pull request.
- `README.md` and `CHANGELOG.md` are updated as part of the PR for each
  stage (`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/),
  entries land under `Unreleased` until a release is cut).
- Once every stage below is complete, `dev` is merged into `staging` for
  end-to-end testing (manual QA, importing generated `.xcs` files into
  xTool Creative Space).
- Once staging testing passes, `staging` is merged into `main`.
- `main` is the production branch: Vercel deploys the site from `main`.

## Stages

### Stage 0 — Project scaffolding ✅
- [x] Scaffold a Vite + React 19 + TypeScript SPA (`npm create vite@latest`).
- [x] Add Tailwind CSS v4 (`@tailwindcss/vite`) and base layout styles.
- [x] Add `oxlint` for linting; wire up `dev` / `build` / `preview` / `lint`
      npm scripts.
- [x] Add `@richardmcquiston01/unofficial-xcs-writer` as a dependency.
- [x] Add `vercel.json` (SPA rewrite to `index.html`, `dist` output dir).
- [x] Confirm `tsconfig*.json` project references match the Vite template.

### Stage 1 — Shared data & assets ✅
- [x] Port the preset phrase list (`src/data/phrases.ts`).
- [x] Port the built-in icon set (`src/data/icons.ts`): star, heart, hexagon,
      arrow, lightning bolt, house — each defined once as viewBox-space
      polygon points, with helpers to render:
      - an SVG `points` string for on-screen preview, and
      - an SVG path `d` string (+ bounding box) for `XCSGenerator.addPath`.

### Stage 2 — Selection & preview UI ✅
- [x] `PhraseSelector` component (pick a preset phrase).
- [x] `IconSelector` component (pick a built-in icon).
- [x] `DesignPreview` component (renders the chosen icon + phrase together).
- [x] `DisclaimerBanner` component (unofficial demo, not affiliated with or
      endorsed by xTool / xTool Creative Space).

### Stage 3 — XCS document builder ✅
- [x] `src/lib/buildXcsDocument.ts`: given a phrase + icon, build an `.xcs`
      project via `new XCSGenerator({ deviceId, canvasWidth, canvasHeight })`:
      - `addPath(...)` for the icon outline, centered on the canvas.
      - `addText(...)` with `layoutGlyphText` for the engraved phrase.
      - Choose and document a sensible default target device id.
- [x] Unit tests (Vitest) covering canvas bounds, path/text placement, and
      that the output round-trips through `assertXcsFormat`.

### Stage 4 — Download & app wiring ✅
- [x] `src/lib/downloadFile.ts`: binary-safe download helper for the
      `Uint8Array` produced by `project.toBytes()`, plus a `slugify` helper
      for the filename (`<slug>.xcs`).
- [x] `App.tsx`: wire phrase/icon state, preview, and a
      "Generate & Download .xcs" button together, mirroring the LightBurn
      demo's layout and copy (swapped to reference xTool Creative Space and
      `@richardmcquiston01/unofficial-xcs-writer`).

### Stage 5 — Styling, donate block & polish ✅
- [x] Match the LightBurn demo's visual polish with Tailwind utility classes.
- [x] Reuse the standard "Buy Me a Coffee" donate block (`DonateCard`,
      `donate-widget.css`, `donate.svg`, README section) already present in
      this repo.
- [x] Footer / copyright, favicon, page title, meta description.
- [x] Accessibility pass (labels, `aria-pressed`, focus states) matching the
      reference demo.

### Stage 6 — QA & deployment
- [x] `npm run lint`, `npm run build` (type-check + build), and Vitest all
      pass in CI.
- [ ] **Needs a human**: manually import a generated `.xcs` file into
      xTool Creative Space and confirm the icon cuts and phrase engraves
      as expected. Sample `.xcs` files for every preset phrase/icon
      combination were generated end-to-end through the deployed app and
      validated against `assertXcsFormat`, but nothing in this
      environment can open the actual xTool Creative Space application.
- [x] Finalize `README.md` (prerequisites, install, usage, examples) and
      `CHANGELOG.md` for the first release (`v1.0.0`).
- [x] Merge `dev` → `staging`; run through the full manual QA pass above
      again on staging.
- [ ] Merge `staging` → `main`; verify the Vercel production deployment.
      Held pending Stage 7 (below) so `main` ships with working
      Cut/Engrave assignment rather than the known v1-format limitation.

### Stage 7 — Adopt the `.xs` (v2) format
xTool Studio v1.7+ saves new projects as `.xs` (a ZIP archive of several
JSON files), not the older single-JSON `.xcs`. `.xcs` still opens but no
longer carries real Cut/Engrave process bindings once re-saved, which is
what Stage 6 QA ran into. `@richardmcquiston01/unofficial-xcs-writer`
v0.5.0 added `.xs` reading/token-substitution (`assertXsFormat`,
`extractXsTokens`, `renderXsFile`) but **not** building a new `.xs`
project from scratch (an open issue in that package).

- [x] Bump the `@richardmcquiston01/unofficial-xcs-writer` dependency to
      `^0.5.0`; confirmed it's a drop-in upgrade (`createXCS`/`.toBytes()`
      unchanged, new `.xs` exports resolve).
- [ ] Decide the `.xs` output approach with the package maintainer:
      template + `renderXsFile` substitution (one real `.xs` template per
      icon, phrase swapped in via a `{{Phrase}}` token) vs. waiting for
      `unofficial-xcs-writer` to support building `.xs` from scratch.
- [ ] Implement whichever approach is chosen; update `buildXcsDocument.ts`
      (or a new `buildXsDocument.ts`), `downloadFile.ts`'s extension/MIME
      type, and `App.tsx`'s button copy accordingly.
- [ ] Re-run the full Stage 6 QA pass (generate + validate every
      phrase/icon combination) against the new output.
- [ ] Update README/CHANGELOG to drop the v1-format known-limitation note.

## Stretch goals (post-1.0)

- [ ] Custom phrase input (free text) in addition to presets.
- [ ] Custom SVG/image upload in addition to built-in icons.
- [ ] Multiple xTool device targets with device-specific defaults.
- [ ] Font family selection for the engraved text.
