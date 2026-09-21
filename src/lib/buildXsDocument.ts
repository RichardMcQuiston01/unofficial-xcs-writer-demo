import {
  XCSGenerator,
  buildXsArchive,
  fontSizePoints,
  layoutGlyphText,
  loadDefaultFont,
  translateGlyphLayout,
} from '@richardmcquiston01/unofficial-xcs-writer';
import { iconToXcsPath, type IconDefinition } from '../data/icons';
import { injectDefaultProfiles } from './xsProfiles';

export interface DesignOptions {
  readonly phrase: string;
  readonly icon: IconDefinition;
  readonly fontFamily?: string;
}

/**
 * Default xTool device this demo targets. xTool Creative Space lets you
 * re-target a project to a different device after import.
 *
 * `CANVAS_SIZE_MM` is the working area this module lays shapes out
 * against; `XCSGeneratorOptions.canvas*` isn't written into the `.xs` file
 * itself (the app derives the visible bed size from the device id), so
 * this is purely our own layout budget.
 */
const DEVICE_ID = 'P2S';
export const CANVAS_SIZE_MM = 300;

const ICON_SIZE_MM = 120;
const ICON_TOP_MM = 40;
const TEXT_EM_SIZE_MM = 24;
const TEXT_TOP_MM = 190;
const DEFAULT_FONT_FAMILY = 'Arial';

/** Cyan is the generator's built-in default layer, used for the cut icon. */
const CUT_LAYER_COLOR = '#00befe';
const ENGRAVE_LAYER_COLOR = '#ed1c24';

/**
 * Composes a phrase and an icon into an xTool Creative Space-ready `.xs`
 * project using the unofficial-xcs-writer package: the icon is placed on
 * the default "Cyan" cut layer and the phrase is engraved as real glyph
 * text on a separate "Engrave Text" layer.
 *
 * As of unofficial-xcs-writer 0.6.0, `.xs` generation doesn't yet write
 * Cut/Engrave process profiles or device bindings (no `addProfile`-style
 * API exists there yet), so this module patches them in itself via
 * `injectDefaultProfiles` — see `xsProfiles.ts` for why that's needed and
 * what it writes. Once the package adds a real profile/binding API, this
 * patch step can be dropped in favor of it.
 */
export function buildXsDocument(options: DesignOptions): Uint8Array {
  const { phrase, icon, fontFamily = DEFAULT_FONT_FAMILY } = options;
  const project = new XCSGenerator({
    deviceId: DEVICE_ID,
    canvasWidth: CANVAS_SIZE_MM,
    canvasHeight: CANVAS_SIZE_MM,
  });
  const font = loadDefaultFont();
  const centerX = CANVAS_SIZE_MM / 2;

  project.addLayer(ENGRAVE_LAYER_COLOR, 'Engrave Text', 2);

  const { d, width: iconWidth, height: iconHeight } = iconToXcsPath(icon, ICON_SIZE_MM);
  project.addPath(d, centerX - iconWidth / 2, ICON_TOP_MM, iconWidth, iconHeight, {
    layerColor: CUT_LAYER_COLOR,
  });

  const measured = layoutGlyphText(font, phrase, TEXT_EM_SIZE_MM, 0, 0);
  if (measured) {
    const layout = translateGlyphLayout(measured, centerX - measured.width / 2, TEXT_TOP_MM);
    project.addText(phrase, layout.x, layout.y, {
      fontFamily,
      fontSize: Math.round(fontSizePoints(TEXT_EM_SIZE_MM)),
      align: 'center',
      layerColor: ENGRAVE_LAYER_COLOR,
      layout,
    });
  }

  const file = project.generate();
  return injectDefaultProfiles(buildXsArchive(file), file);
}
