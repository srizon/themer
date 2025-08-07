'use client';

import { useState } from 'react';
import { ColorSet as ColorSetType } from '@/types/color';
import ColorSwatch from './ColorSwatch';

interface ColorSetProps {
  colorSet: ColorSetType;
  onRemove: (setId: number) => void;
  onUpdate: (setId: number, updates: Partial<ColorSetType>) => void;
  onExport: () => void;
}

export default function ColorSet({ colorSet, onRemove, onUpdate, onExport }: ColorSetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(colorSet.customName || '');

  const handleBaseColorChange = (color: string) => {
    onUpdate(colorSet.id, { baseColor: color });
  };

  const handlePaletteTypeChange = (type: ColorSetType['paletteType']) => {
    onUpdate(colorSet.id, { paletteType: type });
  };

  const handleColorCountChange = (count: number) => {
    onUpdate(colorSet.id, { colorCount: count });
  };

  const handleNameChange = (name: string) => {
    onUpdate(colorSet.id, { customName: name || undefined });
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    handleNameChange(tempName);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameBlur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setTempName(colorSet.customName || '');
      setIsEditingName(false);
    }
  };

  const getPaletteName = () => {
    if (colorSet.customName) return colorSet.customName;
    
    // Generate name based on base color and palette type
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

  return (
    <section className="color-section">
      <div className="section-header">
        <div>
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="input input-text palette-name editing"
              autoFocus
            />
          ) : (
            <h2
              className="palette-name"
              onClick={() => setIsEditingName(true)}
            >
              {getPaletteName()}
            </h2>
          )}
        </div>
        
        <div className="actions">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-icon btn-ghost"
            title={isEditing ? 'Close edit mode' : 'Edit palette'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isEditing ? (
                <path d="M20 6L9 17l-5-5"/>
              ) : (
                <>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </>
              )}
            </svg>
          </button>
          
          <button
            onClick={onExport}
            className="btn btn-icon btn-ghost"
            title="Export"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          
          <button
            onClick={() => onRemove(colorSet.id)}
            className="btn btn-icon btn-ghost"
            title="Remove color set"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      {isEditing && (
        <div className="color-set-controls">
          <div className="control-group">
            <label>Base Color</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={colorSet.baseColor}
                onChange={(e) => handleBaseColorChange(e.target.value)}
                className="input input-color"
              />
              <input
                type="text"
                value={colorSet.baseColor}
                onChange={(e) => handleBaseColorChange(e.target.value)}
                className="input input-text"
              />
            </div>
          </div>
          
          <div className="control-group">
            <label>Type</label>
            <select
              value={colorSet.paletteType}
              onChange={(e) => handlePaletteTypeChange(e.target.value as ColorSetType['paletteType'])}
              className="input input-select"
            >
              <option value="monochromatic">Monochromatic</option>
              <option value="analogous">Analogous</option>
              <option value="complementary">Complementary</option>
              <option value="triadic">Triadic</option>
              <option value="tetradic">Tetradic</option>
              <option value="split-complementary">Split Complementary</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Colors</label>
            <input
              type="number"
              min="3"
              max="20"
              value={colorSet.colorCount}
              onChange={(e) => handleColorCountChange(parseInt(e.target.value))}
              className="input input-number"
            />
          </div>
        </div>
      )}
      
      <div className="color-grid">
        {colorSet.colors.map((color, index) => (
          <ColorSwatch
            key={`${colorSet.id}-${index}`}
            color={color}
            index={index}
            total={colorSet.colors.length}
          />
        ))}
      </div>
    </section>
  );
}
