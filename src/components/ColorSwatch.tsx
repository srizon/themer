'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { calculateTailwindWeight, calculateLuminance, getContrastBetween, hexToHsl, hexToRgb } from '@/lib/colorUtils';

interface ColorSwatchProps {
  color: string;
  index: number;
  total: number;
  paletteColors: string[];
}

export default function ColorSwatch({ color, index, total, paletteColors }: ColorSwatchProps) {
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
      // Check if clipboard API is available
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(color);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = color;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        if (document.execCommand('copy')) {
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        } else {
          console.error('Copy command failed');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy color:', error);
      // Try fallback method if clipboard API fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = color;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        if (document.execCommand('copy')) {
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        } else {
          console.error('Fallback copy also failed');
        }
        
        document.body.removeChild(textArea);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
    }
  };

  // calculateTailwindWeight from shared utils

  const getContrastRatio = (hex: string): string => {
    const [r, g, b] = hexToRgb(hex);
    const luminance = calculateLuminance(r, g, b);
    const whiteLuminance = 1.0;
    const contrastRatio = (Math.max(luminance, whiteLuminance) + 0.05) / (Math.min(luminance, whiteLuminance) + 0.05);
    const ratio = parseFloat(contrastRatio.toFixed(2));
    return `${ratio}:1`;
  };

  // hexToRgb and calculateLuminance from shared utils

  // Choose an accessible text color (black or white) for the given background color
  const getAccessibleTextColor = (hex: string): string => {
    const [r, g, b] = hexToRgb(hex);
    const bgLuminance = calculateLuminance(r, g, b);

    const whiteContrast = (Math.max(bgLuminance, 1) + 0.05) / (Math.min(bgLuminance, 1) + 0.05);
    const blackContrast = (Math.max(bgLuminance, 0) + 0.05) / (Math.min(bgLuminance, 0) + 0.05);

    // Prefer the higher contrast color; ties go to black (usually reads better on light tints)
    const preferred = blackContrast >= whiteContrast ? '#000000' : '#FFFFFF';

    // If the preferred still does not meet 4.5:1, we still return it (it's the best possible of the two)
    return preferred;
  };

  // hexToHsl from shared utils

  // getContrastBetween from shared utils

  // Choose text color strictly from existing palette swatches (not generated) with ≥ 4.5:1 contrast
  const getTextColorFromPalette = (bgHex: string, palette: string[]): string => {
    if (!palette || palette.length === 0) {
      return getAccessibleTextColor(bgHex);
    }

    const normalize = (h: string) => h.trim().toUpperCase();
    const uniquePalette = Array.from(new Set(palette.map(normalize)));

    // Sort palette by lightness ascending (dark → light)
    const paletteWithLightness = uniquePalette
      .map(hex => ({ hex, l: hexToHsl(hex)[2] }))
      .sort((a, b) => a.l - b.l);

    const bgL = hexToHsl(bgHex)[2];
    const bgIsLight = bgL >= 60;
    const darker = paletteWithLightness.filter(p => p.l < bgL);
    const lighter = paletteWithLightness.filter(p => p.l > bgL);

    // Prefer the closest opposite-side shade that passes 7.0 (AAA)
    const primary = (bgIsLight ? darker : lighter).sort((a, b) => Math.abs(a.l - bgL) - Math.abs(b.l - bgL));
    for (const p of primary) {
      if (normalize(p.hex) === normalize(bgHex)) continue;
      if (getContrastBetween(bgHex, p.hex) >= 7.0) return p.hex;
    }

    // If none pass on the opposite side, try the same-side (farther) as a fallback, still closest first
    const secondary = (bgIsLight ? lighter : darker).sort((a, b) => Math.abs(a.l - bgL) - Math.abs(b.l - bgL));
    for (const p of secondary) {
      if (normalize(p.hex) === normalize(bgHex)) continue;
      if (getContrastBetween(bgHex, p.hex) >= 7.0) return p.hex;
    }

    // Fallback to best of black/white
    const blackContrast = getContrastBetween(bgHex, '#000000');
    const whiteContrast = getContrastBetween(bgHex, '#FFFFFF');
    return blackContrast >= whiteContrast ? '#000000' : '#FFFFFF';
  };

  // Mobile text uses palette-based selection
  const getMobileTextColor = (hex: string): string => getTextColorFromPalette(hex, paletteColors);

  const weight = calculateTailwindWeight(index, total);
  const contrastRatio = getContrastRatio(color);
  const textColor = isMobile ? getMobileTextColor(color) : getAccessibleTextColor(color);
  let hexTextColor = textColor;
  if (isMobile) {
    hexTextColor = getTextColorFromPalette(color, paletteColors);
  }
  const hexDisplay = color.replace('#', '').toUpperCase();

  type ColorInfoStyle = CSSProperties & { ['--hex-text-color']?: string };
  const colorInfoStyle: ColorInfoStyle = { color: textColor, '--hex-text-color': hexTextColor };

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
      <div className="color-info" style={colorInfoStyle}>
        <div className="color-weight">{weight}</div>
        <div className="color-contrast">{contrastRatio}</div>
        <div className="color-hex">{hexDisplay}</div>
      </div>
    </div>
  );
}
