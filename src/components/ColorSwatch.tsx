'use client';

import { useState } from 'react';

interface ColorSwatchProps {
  color: string;
  index: number;
  total: number;
}

export default function ColorSwatch({ color, index, total }: ColorSwatchProps) {
  const [showCopied, setShowCopied] = useState(false);

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

  const weight = calculateTailwindWeight(index, total);
  const contrastRatio = getContrastRatio(color);

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
      <div className="color-info">
        <div className="color-weight">{weight}</div>
        <div className="color-contrast">{contrastRatio}</div>
      </div>
    </div>
  );
}
