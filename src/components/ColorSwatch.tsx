'use client';

import { useEffect, useState } from 'react';

interface ColorSwatchProps {
  color: string;
  index: number;
  total: number;
}

export default function ColorSwatch({ color, index, total }: ColorSwatchProps) {
  const [showCopied, setShowCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  };

  const calculateTailwindWeight = (index: number, total: number): number => {
    // For 11 or fewer colors, remove weights from the middle in alternating pattern
    if (total <= 11) {
      if (total === 11) {
        return [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
      } else if (total === 10) {
        return [50, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
      } else if (total === 9) {
        return [50, 200, 300, 400, 500, 600, 700, 800, 950][index];
      } else if (total === 8) {
        return [50, 300, 400, 500, 600, 700, 800, 950][index];
      } else if (total === 7) {
        return [50, 300, 400, 500, 600, 700, 950][index];
      } else if (total === 6) {
        return [50, 400, 500, 600, 700, 950][index];
      } else if (total === 5) {
        return [50, 400, 500, 600, 950][index];
      } else if (total === 4) {
        return [50, 500, 600, 950][index];
      } else if (total === 3) {
        return [50, 500, 950][index];
      } else if (total === 2) {
        return [50, 950][index];
      } else {
        return 500;
      }
    } else {
      // For more than 11 colors, follow the specific pattern
      if (total === 12) {
        return [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
      } else if (total === 13) {
        return [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950][index];
      } else if (total === 14) {
        return [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 950][index];
      } else if (total === 15) {
        return [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950][index];
      } else if (total === 16) {
        return [50, 100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 750, 800, 850, 900, 950][index];
      } else if (total === 17) {
        return [50, 100, 150, 200, 250, 300, 350, 400, 500, 600, 650, 700, 750, 800, 850, 900, 950][index];
      } else if (total === 18) {
        return [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 650, 700, 750, 800, 850, 900, 950][index];
      } else if (total === 19) {
        return [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950][index];
      } else {
        // For 20+ colors, use all weights
        return [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950][index] || 500;
      }
    }
  };

  const getContrastRatio = (hex: string): string => {
    const [r, g, b] = hexToRgb(hex);
    const luminance = calculateLuminance(r, g, b);
    const whiteLuminance = 1.0;
    const contrastRatio = (Math.max(luminance, whiteLuminance) + 0.05) / (Math.min(luminance, whiteLuminance) + 0.05);
    const ratio = parseFloat(contrastRatio.toFixed(2));
    
    return `${ratio}:1`;
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const calculateLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Choose an accessible text color (black or white) for the given background color
  const getAccessibleTextColor = (hex: string): string => {
    const [r, g, b] = hexToRgb(hex);
    const bgLuminance = calculateLuminance(r, g, b);

    const whiteRgb: [number, number, number] = [255, 255, 255];
    const blackRgb: [number, number, number] = [0, 0, 0];

    const whiteContrast = (Math.max(bgLuminance, 1) + 0.05) / (Math.min(bgLuminance, 1) + 0.05);
    const blackContrast = (Math.max(bgLuminance, 0) + 0.05) / (Math.min(bgLuminance, 0) + 0.05);

    // Prefer the higher contrast color; ties go to black (usually reads better on light tints)
    const preferred = blackContrast >= whiteContrast ? '#000000' : '#FFFFFF';

    // If the preferred still does not meet 4.5:1, we still return it (it's the best possible of the two)
    return preferred;
  };

  // Helpers for HSL conversions
  const hexToHsl = (hex: string): [number, number, number] => {
    const [r, g, b] = hexToRgb(hex).map(v => v / 255);
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
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    const sNorm = s / 100;
    const lNorm = l / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    let rP = 0, gP = 0, bP = 0;
    if (0 <= h && h < 60) { rP = c; gP = x; bP = 0; }
    else if (60 <= h && h < 120) { rP = x; gP = c; bP = 0; }
    else if (120 <= h && h < 180) { rP = 0; gP = c; bP = x; }
    else if (180 <= h && h < 240) { rP = 0; gP = x; bP = c; }
    else if (240 <= h && h < 300) { rP = x; gP = 0; bP = c; }
    else { rP = c; gP = 0; bP = x; }
    const r = Math.round((rP + m) * 255);
    const g = Math.round((gP + m) * 255);
    const b = Math.round((bP + m) * 255);
    const toHex = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getContrastBetween = (hex1: string, hex2: string): number => {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    const l1 = calculateLuminance(r1, g1, b1);
    const l2 = calculateLuminance(r2, g2, b2);
    const maxL = Math.max(l1, l2);
    const minL = Math.min(l1, l2);
    return (maxL + 0.05) / (minL + 0.05);
  };

  // Mobile text color: use a deep shade of the same hue for very light swatches
  const getMobileTextColor = (hex: string): string => {
    const [h, s, l] = hexToHsl(hex);
    // Only attempt dark same-hue text for light backgrounds
    if (l >= 75) {
      const candidate = hslToHex(h, Math.min(100, s * 1.05), 15);
      const contrast = getContrastBetween(hex, candidate);
      if (contrast >= 4.5) return candidate;
      // Fallback: choose best of black/white
      const blackContrast = getContrastBetween(hex, '#000000');
      const whiteContrast = getContrastBetween(hex, '#FFFFFF');
      return blackContrast >= whiteContrast ? '#000000' : '#FFFFFF';
    }
    // For mid/dark backgrounds, use standard accessible choice
    return getAccessibleTextColor(hex);
  };

  const weight = calculateTailwindWeight(index, total);
  const contrastRatio = getContrastRatio(color);
  const textColor = isMobile ? getMobileTextColor(color) : getAccessibleTextColor(color);
  const hexDisplay = color.replace('#', '').toUpperCase();

  return (
    <div className="color-swatch">
      <div
        className="color-display"
        style={{ backgroundColor: color }}
        onClick={handleCopy}
      >
        {/* Copy indicator */}
        {showCopied && (
          <div className="copy-indicator show">
            Copied!
          </div>
        )}
      </div>
      
      {/* Color info */}
      <div className="color-info" style={{ color: textColor }}>
        <div className="color-weight">{weight}</div>
        <div className="color-contrast">{contrastRatio}</div>
        <div className="color-hex">{hexDisplay}</div>
      </div>
    </div>
  );
}
