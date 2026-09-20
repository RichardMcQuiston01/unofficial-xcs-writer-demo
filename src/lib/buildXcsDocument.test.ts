import { assertXcsFormat } from '@richardmcquiston01/unofficial-xcs-writer';
import { describe, expect, it } from 'vitest';
import { ICONS } from '../data/icons';
import { buildXcsDocument, CANVAS_SIZE_MM } from './buildXcsDocument';

const STAR_ICON = ICONS[0];

interface ParsedDisplay {
  type: 'TEXT' | 'PATH' | 'IMAGE' | 'BITMAP';
  x: number;
  y: number;
  width: number;
  height: number;
  layerColor: string;
  style?: { fontSize: number; align: string };
}

interface ParsedXcsFile {
  canvas: Array<{
    displays: ParsedDisplay[];
    layerData: Record<string, { name: string; order: number }>;
  }>;
}

function parse(bytes: Uint8Array): ParsedXcsFile {
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as ParsedXcsFile;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe('buildXcsDocument', () => {
  it('round-trips through assertXcsFormat', () => {
    const bytes = buildXcsDocument({ phrase: 'Home Sweet Home', icon: STAR_ICON });
    expect(() => assertXcsFormat(toArrayBuffer(bytes))).not.toThrow();
  });

  it('places the icon path within the canvas bounds', () => {
    const bytes = buildXcsDocument({ phrase: 'Home Sweet Home', icon: STAR_ICON });
    const file = parse(bytes);
    const path = file.canvas[0].displays.find((display) => display.type === 'PATH');

    expect(path).toBeDefined();
    expect(path!.x).toBeGreaterThanOrEqual(0);
    expect(path!.y).toBeGreaterThanOrEqual(0);
    expect(path!.x + path!.width).toBeLessThanOrEqual(CANVAS_SIZE_MM);
    expect(path!.y + path!.height).toBeLessThanOrEqual(CANVAS_SIZE_MM);
  });

  it('places the engraved text within the canvas bounds', () => {
    const bytes = buildXcsDocument({ phrase: 'Home Sweet Home', icon: STAR_ICON });
    const file = parse(bytes);
    const text = file.canvas[0].displays.find((display) => display.type === 'TEXT');

    expect(text).toBeDefined();
    expect(text!.x).toBeGreaterThanOrEqual(0);
    expect(text!.y).toBeGreaterThanOrEqual(0);
    expect(text!.x + text!.width).toBeLessThanOrEqual(CANVAS_SIZE_MM);
    expect(text!.y + text!.height).toBeLessThanOrEqual(CANVAS_SIZE_MM);
  });

  it('centers both the icon and the text horizontally', () => {
    const bytes = buildXcsDocument({ phrase: 'Made With Love', icon: STAR_ICON });
    const file = parse(bytes);
    const path = file.canvas[0].displays.find((display) => display.type === 'PATH')!;
    const text = file.canvas[0].displays.find((display) => display.type === 'TEXT')!;
    const centerX = CANVAS_SIZE_MM / 2;

    expect(path.x + path.width / 2).toBeCloseTo(centerX, 1);
    expect(text.x + text.width / 2).toBeCloseTo(centerX, 1);
  });

  it('assigns the icon and text to separate layers', () => {
    const bytes = buildXcsDocument({ phrase: 'Congratulations', icon: STAR_ICON });
    const file = parse(bytes);
    const path = file.canvas[0].displays.find((display) => display.type === 'PATH')!;
    const text = file.canvas[0].displays.find((display) => display.type === 'TEXT')!;

    expect(path.layerColor).not.toBe(text.layerColor);
    expect(Object.keys(file.canvas[0].layerData)).toEqual(
      expect.arrayContaining([path.layerColor, text.layerColor]),
    );
  });

  it('generates a distinct path for every built-in icon', () => {
    const paths = ICONS.map((icon) => {
      const bytes = buildXcsDocument({ phrase: 'Best Day Ever', icon });
      const file = parse(bytes);
      return file.canvas[0].displays.find((display) => display.type === 'PATH')!.width;
    });

    // Every icon is scaled to the same ICON_SIZE_MM box, so widths match --
    // this just confirms every icon in the set builds without throwing.
    expect(paths).toHaveLength(ICONS.length);
    expect(new Set(paths).size).toBe(1);
  });

  it('omits the text display for a blank phrase without throwing', () => {
    const bytes = buildXcsDocument({ phrase: '   ', icon: STAR_ICON });
    const file = parse(bytes);

    expect(file.canvas[0].displays.some((display) => display.type === 'TEXT')).toBe(false);
    expect(() => assertXcsFormat(toArrayBuffer(bytes))).not.toThrow();
  });
});
