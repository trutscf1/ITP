import type { Vision } from "./tokens-css.ts";

/** sRGB channel (0 to 1) to linear light, with the threshold of WCAG 2.x. */
function linearise(channel: number): number {
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

/** The linear red, green, and blue of an `#rrggbb` colour. */
function linearRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((start) =>
    linearise(Number.parseInt(hex.slice(start, start + 2), 16) / 255),
  ) as [number, number, number];
}

/** WCAG 2.x relative luminance of an `#rrggbb` colour. */
export function luminance(hex: string): number {
  const [r, g, b] = linearRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two colours, from 1 to 21. */
export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}

/** Linear-RGB matrices of Machado, Oliveira and Fernandes (2009), severity 1.0. */
const simulation: Record<
  Exclude<Vision, "none">,
  [number[], number[], number[]]
> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** CIE Lab of an `#rrggbb` colour as a person with the given vision sees it. */
export function seenAs(hex: string, vision: Vision): number[] {
  const linear = linearRgb(hex);
  const rgb =
    vision === "none"
      ? linear
      : simulation[vision].map((row) =>
          Math.min(
            1,
            Math.max(
              0,
              row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2],
            ),
          ),
        );
  const [r, g, b] = rgb as [number, number, number];
  const f = (t: number): number =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** Distance of two colours in CIE Lab (CIE76). */
export function labDistance(a: number[], b: number[]): number {
  return Math.hypot(...a.map((value, index) => value - (b[index] as number)));
}
