'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (colorSet) {
      generateExportCode();
    }
  }, [colorSet, exportFormat, colorFormat]);

  const generateExportCode = () => {
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
  };

  const generateCSSExport = (): string => {
    if (!colorSet) return '';
    
    const colorName = colorSet.customName || generatePaletteName();
    const exportName = formatColorNameForExport(colorName);
    
    let css = ':root {\n';
    colorSet.colors.forEach((color, index) => {
      const weight = calculateTailwindWeight(index, colorSet.colors.length);
      const formattedColor = convertColorFormat(color, colorFormat);
      css += `  --${exportName}-${weight}: ${formattedColor};\n`;
    });
    css += '}';
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
    
    const colorName = getBaseColorName(colorSet.baseColor);
    const typeNames: Record<string, string> = {
      'monochromatic': '',
      'analogous': 'Harmony',
      'complementary': 'Contrast',
      'triadic': 'Balance',
      'tetradic': 'Vibrant',
      'split-complementary': 'Dynamic'
    };
    
    const typeName = typeNames[colorSet.paletteType] || '';
    const baseName = colorName.charAt(0).toUpperCase() + colorName.slice(1);
    return typeName ? `${baseName} ${typeName}` : baseName;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Export Palette</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Export format options */}
          <div>
            <div className="flex gap-2 mb-4">
              {(['css', 'scss', 'json', 'tailwind'] as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    exportFormat === format
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {/* Color format options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Format:
            </label>
            <select
              value={colorFormat}
              onChange={(e) => setColorFormat(e.target.value as ColorFormat)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hex">HEX (#ffffff)</option>
              <option value="rgb">RGB (255, 255, 255)</option>
              <option value="rgba">RGBA (255, 255, 255, 1)</option>
              <option value="hsl">HSL (0, 0%, 100%)</option>
              <option value="hsla">HSLA (0, 0%, 100%, 1)</option>
            </select>
          </div>
          
          {/* Export preview */}
          <div>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-64">
                {exportCode}
              </pre>
            </div>
            <button
              onClick={handleCopy}
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
