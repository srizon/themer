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
    if (total === 11) {
      // Standard Tailwind weights for 11 colors
      const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      return weights[index];
    } else if (total === 13) {
      // Extended weights for 13 colors (like in the image)
      const weights = [50, 125, 200, 275, 350, 425, 500, 575, 650, 725, 800, 875, 950];
      return weights[index];
    } else {
      // For all other counts, create a smooth, evenly distributed progression
      const normalizedIndex = index / (total - 1);
      
      // Always start at 50 and end at 950
      const min = 50;
      const max = 950;
      
      // Use a linear distribution for consistent steps
      // This ensures equal perceptual spacing between weights
      const weight = Math.round(min + (normalizedIndex * (max - min)));
      
      // Round to nearest 25 for cleaner values (like Tailwind standard)
      const rounded = Math.round(weight / 25) * 25;
      
      // Ensure we don't exceed bounds and maintain monotonic increase
      return Math.max(min, Math.min(max, rounded));
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
