'use client';

import { useState, useEffect, useCallback } from 'react';
import { ColorSet, ExportFormat, ColorFormat } from '@/types/color';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorSet: ColorSet | null;
}

export default function ExportModal({ isOpen, onClose, colorSet }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');
  const [colorFormat, setColorFormat] = useState<ColorFormat>('hex');
  const [exportCode, setExportCode] = useState('');

  const generateExportCode = useCallback(() => {
    if (!colorSet) return;

    switch (exportFormat) {
      case 'css':
        setExportCode(generateCSSExport());
        break;
      case 'scss':
        setExportCode(generateSCSSExport());
        break;
      case 'json':
        setExportCode(generateJSONExport());
        break;
      case 'tailwind':
        setExportCode(generateTailwindExport());
        break;
    }
  }, [colorSet, exportFormat, colorFormat]);

  useEffect(() => {
    if (colorSet) {
      generateExportCode();
    }
  }, [generateExportCode]);

  const generateCSSExport = (): string => {
    if (!colorSet) return '';
    
    const colorName = colorSet.customName || generatePaletteName();
    const exportName = formatColorNameForExport(colorName);
    
    let css = '';
    colorSet.colors.forEach((color, index) => {
      const weight = calculateTailwindWeight(index, colorSet.colors.length);
      const formattedColor = convertColorFormat(color, colorFormat);
      css += `--${exportName}-${weight}: ${formattedColor};\n`;
    });
    return css;
  };

  const generateSCSSExport = (): string => {
    if (!colorSet) return '';
    
    const colorName = colorSet.customName || generatePaletteName();
    const exportName = formatColorNameForExport(colorName);
    
    let scss = `// ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} Color Palette\n`;
    colorSet.colors.forEach((color, index) => {
      const weight = calculateTailwindWeight(index, colorSet.colors.length);
      const formattedColor = convertColorFormat(color, colorFormat);
      scss += `$${exportName}-${weight}: ${formattedColor};\n`;
    });
    return scss;
  };

  const generateJSONExport = (): string => {
    if (!colorSet) return '';
    
    const colorName = colorSet.customName || generatePaletteName();
    const exportName = formatColorNameForExport(colorName);
    
    const palette: Record<string, string> = {};
    colorSet.colors.forEach((color, index) => {
      const weight = calculateTailwindWeight(index, colorSet.colors.length);
      const formattedColor = convertColorFormat(color, colorFormat);
      palette[weight] = formattedColor;
    });
    return JSON.stringify({ [exportName]: palette }, null, 2);
  };

  const generateTailwindExport = (): string => {
    if (!colorSet) return '';
    
    const colorName = colorSet.customName || generatePaletteName();
    const exportName = formatColorNameForExport(colorName);
    
    let config = 'module.exports = {\n';
    config += '  theme: {\n';
    config += '    extend: {\n';
    config += '      colors: {\n';
    config += `        ${exportName}: {\n`;
    colorSet.colors.forEach((color, index) => {
      const weight = calculateTailwindWeight(index, colorSet.colors.length);
      const formattedColor = convertColorFormat(color, colorFormat);
      config += `          ${weight}: '${formattedColor}',\n`;
    });
    config += '        }\n';
    config += '      }\n';
    config += '    }\n';
    config += '  }\n';
    config += '}';
    return config;
  };

  const generatePaletteName = (): string => {
    if (!colorSet) return '';
    
    if (colorSet.customName) return colorSet.customName;
    
    const colorName = getBaseColorName(colorSet.baseColor);
    const baseName = colorName.charAt(0).toUpperCase() + colorName.slice(1);
    return baseName;
  };

  const getBaseColorName = (hex: string): string => {
    const [h, s, l] = hexToHsl(hex);
    
    if (s < 15) {
      if (l < 20) return 'black';
      if (l > 80) return 'white';
      return 'gray';
    }
    
    if (l < 15) return 'black';
    if (l > 85) return 'white';
    
    if (h >= 0 && h < 15) return 'red';
    else if (h >= 15 && h < 45) return 'orange';
    else if (h >= 45 && h < 75) return 'yellow';
    else if (h >= 75 && h < 165) return 'green';
    else if (h >= 165 && h < 195) return 'cyan';
    else if (h >= 195 && h < 255) return 'blue';
    else if (h >= 255 && h < 315) return 'purple';
    else if (h >= 315 && h < 345) return 'pink';
    else return 'red';
  };

  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const formatColorNameForExport = (colorName: string): string => {
    return colorName.toLowerCase().replace(/\s+/g, '-');
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

  const convertColorFormat = (hex: string, format: ColorFormat): string => {
    switch (format) {
      case 'hex':
        return hex;
      case 'rgb':
        return hexToRgbString(hex);
      case 'rgba':
        return hexToRgbaString(hex);
      case 'hsl':
        return hexToHslString(hex);
      case 'hsla':
        return hexToHslaString(hex);
      default:
        return hex;
    }
  };

  const hexToRgbString = (hex: string): string => {
    const [r, g, b] = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToRgbaString = (hex: string): string => {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  };

  const hexToHslString = (hex: string): string => {
    const [h, s, l] = hexToHsl(hex);
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  };

  const hexToHslaString = (hex: string): string => {
    const [h, s, l] = hexToHsl(hex);
    return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, 1)`;
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy export code:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-backdrop" onClick={onClose} />
      
      <div className="modal-content">
        <div className="modal-header">
          <h3>Export Palette</h3>
          <button
            onClick={onClose}
            className="btn btn-icon btn-ghost"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          {/* Export format options */}
          <div className="export-section">
            <div className="export-options">
              {(['css', 'scss', 'json', 'tailwind'] as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`export-option ${exportFormat === format ? 'active' : ''}`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {/* Color format options */}
          <div className="export-section">
            <div className="color-format-options">
              <label>
                Color Format:
              </label>
              <select
                value={colorFormat}
                onChange={(e) => setColorFormat(e.target.value as ColorFormat)}
                className="input input-select"
              >
                <option value="hex">HEX (#ffffff)</option>
                <option value="rgb">RGB (255, 255, 255)</option>
                <option value="rgba">RGBA (255, 255, 255, 1)</option>
                <option value="hsl">HSL (0, 0%, 100%)</option>
                <option value="hsla">HSLA (0, 0%, 100%, 1)</option>
              </select>
            </div>
          </div>
          
          {/* Export preview */}
          <div className="export-section">
            <div className="export-preview">
              <pre>
                {exportCode}
              </pre>
            </div>
            <button
              onClick={handleCopy}
              className="btn btn-primary copy-btn"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
