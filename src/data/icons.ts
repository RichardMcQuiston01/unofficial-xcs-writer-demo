/**
 * Built-in SVG image set the demo lets the user pick from.
 *
 * Each icon is a closed, straight-edged polygon defined in a shared
 * 0-100 (y-down) viewBox. The same point set drives both the on-screen
 * `<svg><polygon>` preview and the exported `.xcs` shape (via an SVG
 * path `d` string for `XCSGenerator.addPath`), so what you see is what
 * gets cut.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface IconDefinition {
  readonly id: string;
  readonly name: string;
  readonly points: readonly Point[];
}

const VIEWBOX_SIZE = 100;

export const ICON_VIEWBOX = `0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`;

export const ICONS: readonly IconDefinition[] = [
  {
    id: 'star',
    name: 'Star',
    points: [
      { x: 50, y: 5 },
      { x: 60.58, y: 35.44 },
      { x: 92.8, y: 36.1 },
      { x: 67.12, y: 55.56 },
      { x: 76.45, y: 86.41 },
      { x: 50, y: 68 },
      { x: 23.55, y: 86.41 },
      { x: 32.88, y: 55.56 },
      { x: 7.2, y: 36.1 },
      { x: 39.42, y: 35.44 },
    ],
  },
  {
    id: 'heart',
    name: 'Heart',
    points: [
      { x: 50, y: 25 },
      { x: 35, y: 10 },
      { x: 15, y: 10 },
      { x: 5, y: 30 },
      { x: 5, y: 45 },
      { x: 50, y: 90 },
      { x: 95, y: 45 },
      { x: 95, y: 30 },
      { x: 85, y: 10 },
      { x: 65, y: 10 },
    ],
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    points: [
      { x: 50, y: 5 },
      { x: 88.97, y: 27.5 },
      { x: 88.97, y: 72.5 },
      { x: 50, y: 95 },
      { x: 11.03, y: 72.5 },
      { x: 11.03, y: 27.5 },
    ],
  },
  {
    id: 'arrow',
    name: 'Arrow',
    points: [
      { x: 10, y: 40 },
      { x: 60, y: 40 },
      { x: 60, y: 30 },
      { x: 90, y: 50 },
      { x: 60, y: 70 },
      { x: 60, y: 60 },
      { x: 10, y: 60 },
    ],
  },
  {
    id: 'lightning',
    name: 'Lightning Bolt',
    points: [
      { x: 60, y: 5 },
      { x: 30, y: 55 },
      { x: 48, y: 55 },
      { x: 35, y: 95 },
      { x: 70, y: 40 },
      { x: 52, y: 40 },
    ],
  },
  {
    id: 'house',
    name: 'House',
    points: [
      { x: 50, y: 10 },
      { x: 90, y: 45 },
      { x: 80, y: 45 },
      { x: 80, y: 90 },
      { x: 20, y: 90 },
      { x: 20, y: 45 },
      { x: 10, y: 45 },
    ],
  },
];

/** Renders an icon's points as the `points` attribute of an SVG `<polygon>`. */
export function iconToSvgPoints(icon: IconDefinition): string {
  return icon.points.map((point) => `${point.x},${point.y}`).join(' ');
}

export interface XcsPathData {
  /** SVG path `d` string, in a local coordinate space starting at (0, 0). */
  readonly d: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Converts an icon's viewBox-space points into an SVG path `d` string
 * scaled to fit a `sizeMm` x `sizeMm` box with its top-left corner at the
 * local origin, ready for `XCSGenerator.addPath(d, x, y, width, height)`.
 * `addPath` stores `d` verbatim and positions it via the separate `x`/`y`
 * offset, so the path itself must already be authored in millimeters.
 */
export function iconToXcsPath(icon: IconDefinition, sizeMm: number): XcsPathData {
  const scale = sizeMm / VIEWBOX_SIZE;
  const toCoords = (point: Point): string =>
    `${(point.x * scale).toFixed(3)},${(point.y * scale).toFixed(3)}`;

  const [firstPoint, ...restPoints] = icon.points;
  const d = `M${toCoords(firstPoint)}${restPoints.map((point) => `L${toCoords(point)}`).join('')}Z`;

  return { d, width: sizeMm, height: sizeMm };
}
