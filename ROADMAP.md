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
- [x] **Needs a human**: manually import a generated project file into
      xTool Creative Space and confirm the icon cuts and phrase engraves
      as expected. Superseded by the `.xs`-format verification in Stage 8
      below, since this demo no longer generates the legacy `.xcs` format.
- [x] Finalize `README.md` (prerequisites, install, usage, examples) and
      `CHANGELOG.md` for the first release (`v1.0.0`).
- [x] Merge `dev` → `staging`; run through the full manual QA pass above
      again on staging.
- [ ] Merge `dev` → `staging` again (Stage 7 and 8), then `staging` → `main`;
      verify the Vercel production deployment. Stage 8's Cut/Engrave
      profile patch (see Stage 8 below) has been verified against the real
      xTool Creative Space application.

### Stage 7 — Adopt the `.xs` (v2) format ✅
xTool Studio v1.7+ saves new projects as `.xs` (a ZIP archive of several
JSON files), not the older single-JSON `.xcs`. `.xcs` still opens but no
longer carries real Cut/Engrave process bindings once re-saved, which is
what Stage 6 QA ran into. `@richardmcquiston01/unofficial-xcs-writer`
v0.5.0 added `.xs` reading/token-substitution (`assertXsFormat`,
`extractXsTokens`, `renderXsFile`); v0.6.0 added building a new `.xs`
project from scratch (`XCSGenerator.toXsBytes()`).

- [x] Bump the `@richardmcquiston01/unofficial-xcs-writer` dependency to
      `^0.5.0`; confirmed it's a drop-in upgrade (`createXCS`/`.toBytes()`
      unchanged, new `.xs` exports resolve).
- [x] Bump to `^0.6.0` and adopt `XCSGenerator.toXsBytes()` — a drop-in
      swap for `.toBytes()` — instead of the template/`renderXsFile`
      substitution approach, once the package added from-scratch `.xs`
      building.
- [x] Renamed `buildXcsDocument.ts` → `buildXsDocument.ts`; updated
      `downloadFile.ts`'s call site to a `.xs` filename and
      `application/zip` MIME type, and `App.tsx`'s copy/button text.
- [x] Re-ran the full Stage 6 QA pass (generate + validate every
      phrase/icon combination) against the new `.xs` output.
- [ ] Update README/CHANGELOG to drop the v1-format known-limitation note
      once Cut/Engrave profile/binding support lands upstream (see below).

**Still open**: v0.6.0's `.xs` generation doesn't yet write Cut/Engrave
process profiles or device bindings (no `addProfile`-style API exists in
the package yet) — power/speed/mode still need to be set manually per
shape in xTool Creative Space after import. See Stage 8 below for how this
demo now works around that itself.

### Stage 8 — Patch in default Cut/Engrave profiles ✅
Real-world testing (importing a Stage 7 `.xs` file via "Open Project")
found that Cut/Engrave wasn't just unset — it couldn't be manually assigned
either. Comparing against a real xTool-authored `.xs` file showed why: its
`profiles.json` holds real profile objects and the device file's
`processing[canvasId].modes.LASER_PLANE.bindings[]` maps display ids to
them; a v0.6.0-generated file's `profiles.json` is `{ profiles: {} }` with
no bindings, so xTool Creative Space has nothing to offer in its
Cut/Engrave dropdown at all. (Confirmed indirectly too: importing the same
file into an *existing* project — which already has its own real profiles
— picks up a default "Engrave" assignment and can be reassigned, because
that project's profile library isn't empty.)

- [x] `src/lib/xsProfiles.ts`: `injectDefaultProfiles(xsBytes, file)`
      unzips a generated `.xs` archive (via `fflate`) and patches in a
      default Cut profile (`VECTOR_CUTTING`) bound to every PATH display
      and a default Engrave profile (`VECTOR_ENGRAVING`) bound to every
      TEXT display, matching the schema of a real xTool Creative Space
      project file. Power/speed values are conservative placeholders, not
      tuned to any material.
- [x] `buildXsDocument.ts`: switched from `XCSGenerator.toXsBytes()` to
      `project.generate()` + `buildXsArchive()` (both public exports) so
      the same `XCSFile` object can be reused to build both the archive
      and the profile/binding patch — the display/canvas/device ids have
      to match between them.
- [x] Promoted `fflate` from a dev-only (test) dependency to a real one,
      since profile injection now runs in the browser bundle too.
- [x] Extended the Vitest suite to assert the icon binds to a Cut profile
      and the phrase to an Engrave profile (and that a blank phrase only
      binds the Cut profile).
- [x] **Verified by a human**: re-imported a generated `.xs` file via
      "Open Project" — it opened in a new tab with the correct target
      device (P2S) already selected, and the icon/text group came in set
      to Engrave (freely reassignable), confirming the injected profiles
      and bindings work as intended.
- [ ] Once the package's own profile/binding API lands, revisit whether to
      drop this patch in favor of it.

## Stretch goals (post-1.0)

- [ ] Custom phrase input (free text) in addition to presets.
- [ ] Custom SVG/image upload in addition to built-in icons.
- [ ] Multiple xTool device targets with device-specific defaults.
- [ ] Font family selection for the engraved text.
