import {
  XCSGenerator,
  fontSizePoints,
  layoutGlyphText,
  loadDefaultFont,
  translateGlyphLayout,
  type Processing,
} from '@richardmcquiston01/unofficial-xcs-writer';
import { iconToXcsPath, type IconDefinition } from '../data/icons';

export interface DesignOptions {
  readonly phrase: string;
  readonly icon: IconDefinition;
  readonly fontFamily?: string;
}

/**
 * Default xTool device this demo targets. xTool Creative Space lets you
 * re-target a project to a different device after import. `"P2S"` is a
 * known key in the package's `XTOOL_MACHINES` catalog (since 0.8.0), so
 * `.xs` output gets the real `extId`/`extName`/`deviceCode` for it.
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
 * Default Cut/Engrave processing profiles applied to the icon and text,
 * so `.xs` output has real, reassignable Cut/Engrave settings instead of
 * an empty profile list (confirmed against a real xTool-authored `.xs`
 * file's `profiles.json`). Power/speed values are conservative
 * placeholders, not tuned to any material.
 */
const CUT_PROCESSING: Processing = {
  processingType: 'VECTOR_CUTTING',
  values: {
    power: 60,
    speed: 16,
    repeat: 1,
    cuttingDrop: false,
    sinkingMethod: 'one',
    firstCuttingDropValue: 1,
    cuttingDropValue: 1,
    descentIntervalDescent: 1,
    descentPerStep: 1,
    enableBreakPoint: false,
    breakPointGenMode: 'auto',
    breakPointSize: 0.5,
    breakPointMode: 'count',
    breakPointCount: 2,
    breakPointDistance: 100,
    breakPointPower: 0,
    enableKerf: false,
    kerfDistance: 0,
    airPump: 100,
    enableOverCut: false,
    overCutDistance: 0.5,
  },
};

const ENGRAVE_PROCESSING: Processing = {
  processingType: 'VECTOR_ENGRAVING',
  values: {
    power: 30,
    speed: 100,
    repeat: 1,
    enableKerf: false,
    kerfDistance: 0,
    airPump: 25,
    defocus: false,
    defocus_distance: 8,
  },
};

/**
 * Composes a phrase and an icon into an xTool Creative Space-ready `.xs`
 * project using the unofficial-xcs-writer package: the icon is placed on
 * the default "Cyan" cut layer with a default Cut profile, and the phrase
 * is engraved as real glyph text on a separate "Engrave Text" layer with
 * a default Engrave profile (both via `addPath`/`addText`'s `processing`
 * option, added in unofficial-xcs-writer 0.7.0).
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
    processing: CUT_PROCESSING,
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
      processing: ENGRAVE_PROCESSING,
    });
  }

  return project.toXsBytes();
}
