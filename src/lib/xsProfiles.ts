import type { XCSFile } from '@richardmcquiston01/unofficial-xcs-writer';
import { unzipSync, zipSync } from 'fflate';

/**
 * `XCSGenerator.toXsBytes()` (unofficial-xcs-writer 0.6.0) writes an empty
 * `profiles.json` and empty device processing bindings -- there's no
 * `addProfile`-style API yet to populate them (see its own CHANGELOG).
 * Without at least one real profile per mode, xTool Creative Space has
 * nothing to offer in its Cut/Engrave dropdown, so shapes can't be assigned
 * one even manually -- confirmed against a real xTool-authored `.xs` file,
 * whose `profiles.json` and `devices/device-<id>.json` bindings this
 * mirrors. This module patches a generated archive after the fact with a
 * default Cut profile bound to every PATH display and a default Engrave
 * profile bound to every TEXT display.
 *
 * Power/speed values below are conservative placeholders, not tuned to any
 * material -- they exist so the profiles are assignable and editable in
 * xTool Creative Space, not as ready-to-cut settings.
 */

const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomId(prefix: string): string {
  let suffix = '';
  for (let i = 0; i < 12; i++) {
    suffix += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return `${prefix}:${suffix}`;
}

function decodeJson<T>(bytes: Uint8Array): T {
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

function encodeJson(value: unknown): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(JSON.stringify(value)) as Uint8Array<ArrayBuffer>;
}

const CUT_PROFILE_VALUES = {
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
};

const ENGRAVE_PROFILE_VALUES = {
  power: 30,
  speed: 100,
  repeat: 1,
  enableKerf: false,
  kerfDistance: 0,
  airPump: 25,
  defocus: false,
  defocus_distance: 8,
};

interface ProcessingBinding {
  bindingId: string;
  canvasId: string;
  mode: string;
  baseProfileId: string;
  displayIds: string[];
}

interface DeviceProcessingMode {
  profileRefs: string[];
  bindings: ProcessingBinding[];
  [key: string]: unknown;
}

interface DeviceFile {
  processing: Record<string, { modes: Record<string, DeviceProcessingMode> }>;
  [key: string]: unknown;
}

/**
 * Patches a `.xs` archive produced by `XCSGenerator.toXsBytes()` (or
 * `buildXsArchive()`) with a default Cut profile bound to every PATH
 * display and a default Engrave profile bound to every TEXT display, so
 * xTool Creative Space has real Cut/Engrave options to assign -- and shows
 * a sensible default -- instead of an empty profile list. `file` must be
 * the same `XCSFile` the archive was built from, since display/canvas/
 * device ids have to match.
 */
export function injectDefaultProfiles(xsBytes: Uint8Array, file: XCSFile): Uint8Array {
  const canvas = file.canvas[0];
  if (!canvas) return xsBytes;

  const cutDisplayIds = canvas.displays.filter((display) => display.type === 'PATH').map((d) => d.id);
  const engraveDisplayIds = canvas.displays
    .filter((display) => display.type === 'TEXT')
    .map((d) => d.id);
  if (cutDisplayIds.length === 0 && engraveDisplayIds.length === 0) return xsBytes;

  const cutProfileId = randomId('profile');
  const engraveProfileId = randomId('profile');

  const entries = unzipSync(xsBytes);

  entries['profiles.json'] = encodeJson({
    profiles: {
      [cutProfileId]: {
        id: cutProfileId,
        processingType: 'VECTOR_CUTTING',
        values: CUT_PROFILE_VALUES,
      },
      [engraveProfileId]: {
        id: engraveProfileId,
        processingType: 'VECTOR_ENGRAVING',
        values: ENGRAVE_PROFILE_VALUES,
      },
    },
  });

  const devicePath = `devices/device-${file.device.id}.json`;
  const device = decodeJson<DeviceFile>(entries[devicePath]);
  const mode = device.processing[canvas.id].modes.LASER_PLANE;

  mode.profileRefs = [cutProfileId, engraveProfileId];
  mode.bindings = [
    cutDisplayIds.length > 0
      ? {
          bindingId: randomId('binding'),
          canvasId: canvas.id,
          mode: 'LASER_PLANE',
          baseProfileId: cutProfileId,
          displayIds: cutDisplayIds,
        }
      : null,
    engraveDisplayIds.length > 0
      ? {
          bindingId: randomId('binding'),
          canvasId: canvas.id,
          mode: 'LASER_PLANE',
          baseProfileId: engraveProfileId,
          displayIds: engraveDisplayIds,
        }
      : null,
  ].filter((binding): binding is ProcessingBinding => binding !== null);
  entries[devicePath] = encodeJson(device);

  return zipSync(entries);
}
