// Shared color and palette utilities

export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function calculateLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const channel = c / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastBetween(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = calculateLuminance(r1, g1, b1);
  const l2 = calculateLuminance(r2, g2, b2);
  const maxL = Math.max(l1, l2);
  const minL = Math.min(l1, l2);
  return (maxL + 0.05) / (minL + 0.05);
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return [h, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let rP = 0,
    gP = 0,
    bP = 0;
  if (0 <= h && h < 60) {
    rP = c;
    gP = x;
    bP = 0;
  } else if (60 <= h && h < 120) {
    rP = x;
    gP = c;
    bP = 0;
  } else if (120 <= h && h < 180) {
    rP = 0;
    gP = c;
    bP = x;
  } else if (180 <= h && h < 240) {
    rP = 0;
    gP = x;
    bP = c;
  } else if (240 <= h && h < 300) {
    rP = 0;
    gP = 0;
    bP = x;
  } else {
    rP = c;
    gP = 0;
    bP = x;
  }
  const r = Math.round((rP + m) * 255);
  const g = Math.round((gP + m) * 255);
  const b = Math.round((bP + m) * 255);
  const toHex = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function calculateTailwindWeight(index: number, total: number): number {
  if (total <= 11) {
    if (total === 11) return [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
    if (total === 10) return [50, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
    if (total === 9) return [50, 200, 300, 400, 500, 600, 700, 800, 950][index];
    if (total === 8) return [50, 300, 400, 500, 600, 700, 800, 950][index];
    if (total === 7) return [50, 300, 400, 500, 600, 700, 950][index];
    if (total === 6) return [50, 400, 500, 600, 700, 950][index];
    if (total === 5) return [50, 400, 500, 600, 950][index];
    if (total === 4) return [50, 500, 600, 950][index];
    if (total === 3) return [50, 500, 950][index];
    if (total === 2) return [50, 950][index];
    return 500;
  }

  if (total === 12) return [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
  if (total === 13) return [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950][index];
  if (total === 14)
    return [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 950][index];
  if (total === 15)
    return [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950][index];
  if (total === 16)
    return [50, 100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 750, 800, 850, 900, 950][index];
  if (total === 17)
    return [50, 100, 150, 200, 250, 300, 350, 400, 500, 600, 650, 700, 750, 800, 850, 900, 950][index];
  if (total === 18)
    return [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 650, 700, 750, 800, 850, 900, 950][index];
  if (total === 19)
    return [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950][index];

  // 20+
  return (
    [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950][index] || 500
  );
}


