# Unofficial XCS Writer Demo

## Overview

Single Page Application (SPA) demo page demonstrating the features of the unofficial-xcs-writer NPM package (`@richardmcquiston01/unofficial-xcs-writer`). User can choose from a set of phrases, select an image from a set of SVG images, and then generate an `.xs` file which can be imported into xTool Creative Space. Demo page will be deployed on Vercel.

This project is not affiliated with, endorsed by, or supported by xTool.

See [ROADMAP.md](./ROADMAP.md) for the staged development plan and branching workflow.

## Getting Started

### Prerequisites

- Node.js 20+

### Installation

```sh
npm install
```

### Usage

```sh
npm run dev       # start the local dev server
npm run build     # type-check and build for production
npm run preview   # preview the production build
npm run lint      # lint with oxlint
npm test          # run the Vitest suite
```

### Examples

1. Pick one of the preset phrases.
2. Pick one of the built-in SVG images (star, heart, hexagon, arrow,
   lightning bolt, house).
3. Review the combined preview.
4. Click **Generate & Download .xs** to download an xTool Creative
   Space-ready project file with the image cut as a vector path and the
   phrase engraved as text, built with
   [`@richardmcquiston01/unofficial-xcs-writer`](https://www.npmjs.com/package/@richardmcquiston01/unofficial-xcs-writer).

## Buy Me a Coffee

If this app, code, or repository has helped you or someone you know, please consider donating. I appreciate any help to offset the costs of development and/or AI Credits.

[**Donate via Stripe**](https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800), or scan:

[![Donate via Stripe](./donate.svg)](https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800)

## License

Apache 2

## Copyright

(c)2026 Richard McQuiston.  All rights reserved.
