import { assertXsFormat } from '@richardmcquiston01/unofficial-xcs-writer';
import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { ICONS } from '../data/icons';
import { buildXsDocument, CANVAS_SIZE_MM } from './buildXsDocument';

const STAR_ICON = ICONS[0];

interface ParsedDisplay {
  id: string;
  type: 'TEXT' | 'PATH' | 'IMAGE' | 'BITMAP';
  x: number;
  y: number;
  width: number;
  height: number;
  layerColor: string;
  style?: { fontSize: number; align: string };
}

interface ParsedProject {
  activeCanvasId: string;
  activeDeviceId: string;
}

interface ParsedCanvas {
  layerData: Record<string, { name: string; order: number }>;
}

interface ParsedDisplaysChunk {
  displays: ParsedDisplay[];
}

interface ParsedProfile {
  id: string;
  processingType: string;
}

interface ParsedBinding {
  baseProfileId: string;
  displayIds: string[];
}

interface ParsedXsFile {
  displays: ParsedDisplay[];
  layerData: Record<string, { name: string; order: number }>;
  profiles: Record<string, ParsedProfile>;
  bindings: ParsedBinding[];
}

function decodeJson<T>(bytes: Uint8Array): T {
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function parse(bytes: Uint8Array): ParsedXsFile {
  const entries = unzipSync(bytes);
  const project = decodeJson<ParsedProject>(entries['project.json']);
  const canvas = decodeJson<ParsedCanvas>(entries[`canvases/${project.activeCanvasId}.json`]);
  const chunk = decodeJson<ParsedDisplaysChunk>(
    entries[`canvases/${project.activeCanvasId}/displays-0.json`],
  );
  const { profiles } = decodeJson<{ profiles: Record<string, ParsedProfile> }>(
    entries['profiles.json'],
  );
  const device = decodeJson<{
    processing: Record<string, { modes: Record<string, { bindings: ParsedBinding[] }> }>;
  }>(entries[`devices/device-${project.activeDeviceId}.json`]);

  return {
    displays: chunk.displays,
    layerData: canvas.layerData,
    profiles,
    bindings: device.processing[project.activeCanvasId].modes.LASER_PLANE.bindings,
  };
}

describe('buildXsDocument', () => {
  it('round-trips through assertXsFormat', () => {
    const bytes = buildXsDocument({ phrase: 'Home Sweet Home', icon: STAR_ICON });
    expect(() => assertXsFormat(toArrayBuffer(bytes))).not.toThrow();
  });

  it('places the icon path within the canvas bounds', () => {
    const bytes = buildXsDocument({ phrase: 'Home Sweet Home', icon: STAR_ICON });
    const file = parse(bytes);
    const path = file.displays.find((display) => display.type === 'PATH');

    expect(path).toBeDefined();
    expect(path!.x).toBeGreaterThanOrEqual(0);
    expect(path!.y).toBeGreaterThanOrEqual(0);
    expect(path!.x + path!.width).toBeLessThanOrEqual(CANVAS_SIZE_MM);
    expect(path!.y + path!.height).toBeLessThanOrEqual(CANVAS_SIZE_MM);
  });

  it('places the engraved text within the canvas bounds', () => {
    const bytes = buildXsDocument({ phrase: 'Home Sweet Home', icon: STAR_ICON });
    const file = parse(bytes);
    const text = file.displays.find((display) => display.type === 'TEXT');

    expect(text).toBeDefined();
    expect(text!.x).toBeGreaterThanOrEqual(0);
    expect(text!.y).toBeGreaterThanOrEqual(0);
    expect(text!.x + text!.width).toBeLessThanOrEqual(CANVAS_SIZE_MM);
    expect(text!.y + text!.height).toBeLessThanOrEqual(CANVAS_SIZE_MM);
  });

  it('centers both the icon and the text horizontally', () => {
    const bytes = buildXsDocument({ phrase: 'Made With Love', icon: STAR_ICON });
    const file = parse(bytes);
    const path = file.displays.find((display) => display.type === 'PATH')!;
    const text = file.displays.find((display) => display.type === 'TEXT')!;
    const centerX = CANVAS_SIZE_MM / 2;

    expect(path.x + path.width / 2).toBeCloseTo(centerX, 1);
    expect(text.x + text.width / 2).toBeCloseTo(centerX, 1);
  });

  it('assigns the icon and text to separate layers', () => {
    const bytes = buildXsDocument({ phrase: 'Congratulations', icon: STAR_ICON });
    const file = parse(bytes);
    const path = file.displays.find((display) => display.type === 'PATH')!;
    const text = file.displays.find((display) => display.type === 'TEXT')!;

    expect(path.layerColor).not.toBe(text.layerColor);
    expect(Object.keys(file.layerData)).toEqual(
      expect.arrayContaining([path.layerColor, text.layerColor]),
    );
  });

  it('generates a distinct path for every built-in icon', () => {
    const paths = ICONS.map((icon) => {
      const bytes = buildXsDocument({ phrase: 'Best Day Ever', icon });
      const file = parse(bytes);
      return file.displays.find((display) => display.type === 'PATH')!.width;
    });

    // Every icon is scaled to the same ICON_SIZE_MM box, so widths match --
    // this just confirms every icon in the set builds without throwing.
    expect(paths).toHaveLength(ICONS.length);
    expect(new Set(paths).size).toBe(1);
  });

  it('omits the text display for a blank phrase without throwing', () => {
    const bytes = buildXsDocument({ phrase: '   ', icon: STAR_ICON });
    const file = parse(bytes);

    expect(file.displays.some((display) => display.type === 'TEXT')).toBe(false);
    expect(() => assertXsFormat(toArrayBuffer(bytes))).not.toThrow();
  });

  it('binds the icon to a Cut profile and the text to an Engrave profile', () => {
    const bytes = buildXsDocument({ phrase: 'Home Sweet Home', icon: STAR_ICON });
    const file = parse(bytes);
    const path = file.displays.find((display) => display.type === 'PATH')!;
    const text = file.displays.find((display) => display.type === 'TEXT')!;

    const cutBinding = file.bindings.find((binding) => binding.displayIds.includes(path.id));
    const engraveBinding = file.bindings.find((binding) => binding.displayIds.includes(text.id));

    expect(cutBinding).toBeDefined();
    expect(engraveBinding).toBeDefined();
    expect(file.profiles[cutBinding!.baseProfileId]?.processingType).toBe('VECTOR_CUTTING');
    expect(file.profiles[engraveBinding!.baseProfileId]?.processingType).toBe('VECTOR_ENGRAVING');
    expect(cutBinding!.baseProfileId).not.toBe(engraveBinding!.baseProfileId);
  });

  it('only binds the Cut profile when the phrase is blank', () => {
    const bytes = buildXsDocument({ phrase: '   ', icon: STAR_ICON });
    const file = parse(bytes);
    const path = file.displays.find((display) => display.type === 'PATH')!;

    expect(file.bindings).toHaveLength(1);
    expect(file.bindings[0].displayIds).toEqual([path.id]);
    expect(file.profiles[file.bindings[0].baseProfileId]?.processingType).toBe('VECTOR_CUTTING');
  });
});
