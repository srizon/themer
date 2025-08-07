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
      const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      return weights[index];
    } else if (total <= 10) {
      const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      const step = Math.floor(weights.length / total);
      return weights[Math.min(index * step, weights.length - 1)];
    } else {
      const min = 50;
      const max = 950;
      const step = (max - min) / (total - 1);
      return Math.round(min + (index * step));
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
    <div className="group relative">
      <div
        className="aspect-square rounded-lg cursor-pointer relative overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
        style={{ backgroundColor: color }}
        onClick={handleCopy}
      >
        {/* Copy indicator */}
        {showCopied && (
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white flex items-center justify-center text-sm font-medium animate-in fade-in duration-200">
            Copied!
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
      </div>
      
      {/* Color info */}
      <div className="mt-2 text-center">
        <div className="text-xs font-medium text-gray-900">{weight}</div>
        <div className="text-xs text-gray-500">{contrastRatio}</div>
      </div>
    </div>
  );
}
