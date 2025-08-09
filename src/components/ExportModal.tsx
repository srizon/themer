'use client';

import { useState, useEffect } from 'react';
import { ColorSet, ExportFormat, ColorFormat } from '@/types/color';
import { calculateTailwindWeight, hexToHsl, hexToRgb, getEnhancedColorName } from '@/lib/colorUtils';

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
    
    // Use enhanced color naming
    return getEnhancedColorName(colorSet.baseColor);
  };

  const formatColorNameForExport = (colorName: string): string => {
    return colorName.toLowerCase().replace(/\s+/g, '-');
  };

  const convertColorFormat = (hex: string, format: ColorFormat): string => {
    switch (format) {
      case 'hex':
        return hex;
      case 'rgb': {
        const [r, g, b] = hexToRgb(hex);
        return `rgb(${r}, ${g}, ${b})`;
      }
      case 'rgba': {
        const [r, g, b] = hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, 1)`;
      }
      case 'hsl': {
        const [h, s, l] = hexToHsl(hex);
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
      }
      case 'hsla': {
        const [h, s, l] = hexToHsl(hex);
        return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, 1)`;
      }
      default:
        return hex;
    }
  };

  const handleCopy = async () => {
    try {
      // Check if clipboard API is available
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(exportCode);
        // You could add a toast notification here
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = exportCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        if (!document.execCommand('copy')) {
          console.error('Copy command failed');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy export code:', error);
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = exportCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        if (!document.execCommand('copy')) {
          console.error('Fallback copy also failed');
        }
        
        document.body.removeChild(textArea);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`} role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
      <div className="modal-backdrop" onClick={onClose} />
      
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="export-modal-title">Export Palette</h3>
          <button
            onClick={onClose}
            className="btn btn-icon btn-ghost"
            aria-label="Close export modal"
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
                  aria-pressed={exportFormat === format}
                  aria-label={`Export as ${format.toUpperCase()}`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {/* Color format options */}
          <div className="export-section">
            <div className="color-format-options">
              <label htmlFor="color-format-select">
                Color Format:
              </label>
              <select
                id="color-format-select"
                value={colorFormat}
                onChange={(e) => setColorFormat(e.target.value as ColorFormat)}
                className="input input-select"
                aria-label="Select color format"
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
              <pre aria-label="Export code preview">
                {exportCode}
              </pre>
            </div>
            <button
              onClick={handleCopy}
              className="btn btn-primary copy-btn"
              aria-label="Copy export code to clipboard"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
