'use client';

import { useState, useEffect } from 'react';
import { ColorSet as ColorSetType } from '@/types/color';
import { getEnhancedColorName } from '@/lib/colorUtils';
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
  
  // Local state for input values to allow empty states
  const [tempInputValues, setTempInputValues] = useState({
    colorCount: colorSet.colorCount.toString(),
    saturationCurve: (colorSet.saturationCurve ?? 0).toString(),
    minContrast: (colorSet.minContrast ?? 1.05).toString(),
    maxContrast: (colorSet.maxContrast ?? 19.5).toString(),
    minLightness: (colorSet.minLightness ?? 5).toString(),
    maxLightness: (colorSet.maxLightness ?? 95).toString(),
  });

  // Sync local state when colorSet props change
  useEffect(() => {
    setTempInputValues({
      colorCount: colorSet.colorCount.toString(),
      saturationCurve: (colorSet.saturationCurve ?? 0).toString(),
      minContrast: (colorSet.minContrast ?? 1.05).toString(),
      maxContrast: (colorSet.maxContrast ?? 19.5).toString(),
      minLightness: (colorSet.minLightness ?? 5).toString(),
      maxLightness: (colorSet.maxLightness ?? 95).toString(),
    });
  }, [colorSet.colorCount, colorSet.saturationCurve, colorSet.minContrast, colorSet.maxContrast, colorSet.minLightness, colorSet.maxLightness]);

  const handleBaseColorChange = (color: string) => {
    onUpdate(colorSet.id, { baseColor: color });
  };

  const handleColorCountChange = (value: string) => {
    setTempInputValues(prev => ({ ...prev, colorCount: value }));
  };
  
  const handleColorCountBlur = () => {
    if (tempInputValues.colorCount === '') {
      // Use default value
      const defaultValue = 10;
      onUpdate(colorSet.id, { colorCount: defaultValue });
      setTempInputValues(prev => ({ ...prev, colorCount: defaultValue.toString() }));
    } else {
      const numValue = parseInt(tempInputValues.colorCount);
      if (isNaN(numValue)) {
        // Reset to current value if invalid
        setTempInputValues(prev => ({ ...prev, colorCount: colorSet.colorCount.toString() }));
      } else {
        // Clamp to valid range
        const clampedValue = Math.max(1, Math.min(19, numValue));
        onUpdate(colorSet.id, { colorCount: clampedValue });
        setTempInputValues(prev => ({ ...prev, colorCount: clampedValue.toString() }));
      }
    }
  };

  // Helper function to calculate lightness from contrast
  const calculateLightnessFromContrast = (contrast: number, isMinContrast: boolean): number => {
    // For min contrast (low values like 1.05), we need high lightness (100%)
    // For max contrast (high values like 21), we need low lightness (0%)
    if (isMinContrast) {
      // Min contrast -> Max lightness
      // Lower contrast = higher lightness
      const normalizedContrast = Math.max(1, Math.min(21, contrast));
      const lightness = 100 - ((normalizedContrast - 1) * 5); // 1.05 -> 100%, 21 -> 0%
      return Math.max(0, Math.min(100, Math.round(lightness)));
    } else {
      // Max contrast -> Min lightness
      // Higher contrast = lower lightness
      const normalizedContrast = Math.max(1, Math.min(21, contrast));
      const lightness = 0 + ((21 - normalizedContrast) * 5); // 21 -> 0%, 1.05 -> 100%
      return Math.max(0, Math.min(100, Math.round(lightness)));
    }
  };

  // Helper function to calculate contrast from lightness
  const calculateContrastFromLightness = (lightness: number, isMaxLightness: boolean): number => {
    if (isMaxLightness) {
      // Max lightness -> Min contrast
      // Higher lightness = lower contrast
      const normalizedLightness = Math.max(0, Math.min(100, lightness));
      const contrast = 1 + ((100 - normalizedLightness) / 5); // 100% -> 1.05, 0% -> 21
      return Math.max(1.05, Math.min(21, Math.round(contrast * 100) / 100));
    } else {
      // Min lightness -> Max contrast
      // Lower lightness = higher contrast
      const normalizedLightness = Math.max(0, Math.min(100, lightness));
      const contrast = 21 - ((normalizedLightness - 0) / 5); // 0% -> 21, 100% -> 1.05
      return Math.max(1.05, Math.min(21, Math.round(contrast * 100) / 100));
    }
  };

  const handleMinContrastChange = (value: string) => {
    setTempInputValues(prev => ({ ...prev, minContrast: value }));
  };
  
  const handleMinContrastBlur = () => {
    if (tempInputValues.minContrast === '') {
      // Use default value
      const defaultValue = 1.05;
      const updates: Partial<ColorSetType> = { minContrast: defaultValue };
      
      // Auto-update max lightness when min contrast changes
      const newMaxLightness = calculateLightnessFromContrast(defaultValue, true);
      updates.maxLightness = newMaxLightness;
      
      onUpdate(colorSet.id, updates);
      setTempInputValues(prev => ({ ...prev, minContrast: defaultValue.toString() }));
    } else {
      const numValue = parseFloat(tempInputValues.minContrast);
      if (isNaN(numValue)) {
        // Reset to current value if invalid
        setTempInputValues(prev => ({ ...prev, minContrast: (colorSet.minContrast ?? 1.05).toString() }));
      } else {
        // Clamp to valid range and validate against max contrast
        const maxContrast = colorSet.maxContrast ?? 19.5;
        const clampedValue = Math.max(1, Math.min(21, Math.min(maxContrast, numValue)));
        
        const updates: Partial<ColorSetType> = { minContrast: clampedValue };
        
        // Auto-update max lightness when min contrast changes
        const newMaxLightness = calculateLightnessFromContrast(clampedValue, true);
        updates.maxLightness = newMaxLightness;
        
        onUpdate(colorSet.id, updates);
        setTempInputValues(prev => ({ ...prev, minContrast: clampedValue.toString() }));
      }
    }
  };

  const handleMaxContrastChange = (value: string) => {
    setTempInputValues(prev => ({ ...prev, maxContrast: value }));
  };
  
  const handleMaxContrastBlur = () => {
    if (tempInputValues.maxContrast === '') {
      // Use default value
      const defaultValue = 19.5;
      const updates: Partial<ColorSetType> = { maxContrast: defaultValue };
      
      // Auto-update min lightness when max contrast changes
      const newMinLightness = calculateLightnessFromContrast(defaultValue, false);
      updates.minLightness = newMinLightness;
      
      onUpdate(colorSet.id, updates);
      setTempInputValues(prev => ({ ...prev, maxContrast: defaultValue.toString() }));
    } else {
      const numValue = parseFloat(tempInputValues.maxContrast);
      if (isNaN(numValue)) {
        // Reset to current value if invalid
        setTempInputValues(prev => ({ ...prev, maxContrast: (colorSet.maxContrast ?? 19.5).toString() }));
      } else {
        // Clamp to valid range and validate against min contrast
        const minContrast = colorSet.minContrast ?? 1.05;
        const clampedValue = Math.max(1, Math.min(21, Math.max(minContrast, numValue)));
        
        const updates: Partial<ColorSetType> = { maxContrast: clampedValue };
        
        // Auto-update min lightness when max contrast changes
        const newMinLightness = calculateLightnessFromContrast(clampedValue, false);
        updates.minLightness = newMinLightness;
        
        onUpdate(colorSet.id, updates);
        setTempInputValues(prev => ({ ...prev, maxContrast: clampedValue.toString() }));
      }
    }
  };

  const handleMinLightnessChange = (value: string) => {
    setTempInputValues(prev => ({ ...prev, minLightness: value }));
  };
  
  const handleMinLightnessBlur = () => {
    if (tempInputValues.minLightness === '') {
      // Use default value
      const defaultValue = 5;
      const updates: Partial<ColorSetType> = { minLightness: defaultValue };
      
      // Auto-update max contrast when min lightness changes
      const newMaxContrast = calculateContrastFromLightness(defaultValue, false);
      updates.maxContrast = newMaxContrast;
      
      onUpdate(colorSet.id, updates);
      setTempInputValues(prev => ({ ...prev, minLightness: defaultValue.toString() }));
    } else {
      const numValue = parseInt(tempInputValues.minLightness);
      if (isNaN(numValue)) {
        // Reset to current value if invalid
        setTempInputValues(prev => ({ ...prev, minLightness: (colorSet.minLightness ?? 5).toString() }));
      } else {
        // Clamp to valid range and validate against max lightness
        const maxLightness = colorSet.maxLightness ?? 95;
        const clampedValue = Math.max(0, Math.min(100, Math.min(maxLightness, numValue)));
        
        const updates: Partial<ColorSetType> = { minLightness: clampedValue };
        
        // Auto-update max contrast when min lightness changes
        const newMaxContrast = calculateContrastFromLightness(clampedValue, false);
        updates.maxContrast = newMaxContrast;
        
        onUpdate(colorSet.id, updates);
        setTempInputValues(prev => ({ ...prev, minLightness: clampedValue.toString() }));
      }
    }
  };

  const handleSaturationCurveChange = (value: string) => {
    setTempInputValues(prev => ({ ...prev, saturationCurve: value }));
  };
  
  const handleSaturationCurveBlur = () => {
    if (tempInputValues.saturationCurve === '') {
      // Use default value
      const defaultValue = 0;
      onUpdate(colorSet.id, { saturationCurve: defaultValue });
      setTempInputValues(prev => ({ ...prev, saturationCurve: defaultValue.toString() }));
    } else {
      const numValue = parseInt(tempInputValues.saturationCurve);
      if (isNaN(numValue)) {
        // Reset to current value if invalid
        setTempInputValues(prev => ({ ...prev, saturationCurve: (colorSet.saturationCurve ?? 0).toString() }));
      } else {
        // Clamp to valid range
        const clampedValue = Math.max(-100, Math.min(100, numValue));
        onUpdate(colorSet.id, { saturationCurve: clampedValue });
        setTempInputValues(prev => ({ ...prev, saturationCurve: clampedValue.toString() }));
      }
    }
  };

  const handleMaxLightnessChange = (value: string) => {
    setTempInputValues(prev => ({ ...prev, maxLightness: value }));
  };
  
  const handleMaxLightnessBlur = () => {
    if (tempInputValues.maxLightness === '') {
      // Use default value
      const defaultValue = 95;
      const updates: Partial<ColorSetType> = { maxLightness: defaultValue };
      
      // Auto-update min contrast when max lightness changes
      const newMinContrast = calculateContrastFromLightness(defaultValue, true);
      updates.minContrast = newMinContrast;
      
      onUpdate(colorSet.id, updates);
      setTempInputValues(prev => ({ ...prev, maxLightness: defaultValue.toString() }));
    } else {
      const numValue = parseInt(tempInputValues.maxLightness);
      if (isNaN(numValue)) {
        // Reset to current value if invalid
        setTempInputValues(prev => ({ ...prev, maxLightness: (colorSet.maxLightness ?? 95).toString() }));
      } else {
        // Clamp to valid range and validate against min lightness
        const minLightness = colorSet.minLightness ?? 5;
        const clampedValue = Math.max(1, Math.min(100, Math.max(minLightness, numValue)));
        
        const updates: Partial<ColorSetType> = { maxLightness: clampedValue };
        
        // Auto-update min contrast when max lightness changes
        const newMinContrast = calculateContrastFromLightness(clampedValue, true);
        updates.minContrast = newMinContrast;
        
        onUpdate(colorSet.id, updates);
        setTempInputValues(prev => ({ ...prev, maxLightness: clampedValue.toString() }));
      }
    }
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
    // Use persisted generatedName if available; fallback to deterministic generation
    return colorSet.generatedName || getEnhancedColorName(colorSet.baseColor);
  };

  // hexToHsl moved to shared utils

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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      {isEditing && (
        <div 
          className="color-set-controls"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div 
            className="control-group"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <label
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >Base Color</label>
            <div 
              className="color-input-wrapper"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <input
                type="color"
                value={colorSet.baseColor}
                onChange={(e) => handleBaseColorChange(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="input input-color"
              />
              <input
                type="text"
                value={colorSet.baseColor}
                onChange={(e) => handleBaseColorChange(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="input input-text"
              />
            </div>
          </div>

          <div 
            className="control-group"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <label
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >Shades</label>
            <input
              type="number"
              min="1"
              max="19"
              value={tempInputValues.colorCount}
              onChange={(e) => handleColorCountChange(e.target.value)}
              onBlur={handleColorCountBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="input input-number"
            />
          </div>

          <div 
            className="control-group"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <label
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >Saturation Curve</label>
            <input
              type="number"
              min="-100"
              max="100"
              step="1"
              value={tempInputValues.saturationCurve}
              onChange={(e) => handleSaturationCurveChange(e.target.value)}
              onBlur={handleSaturationCurveBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="input input-number"
            />
          </div>

          <div 
            className="control-group"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <label
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >Min Contrast</label>
            <input
              type="number"
              min="1"
              max="21"
              step="0.1"
              value={tempInputValues.minContrast}
              onChange={(e) => handleMinContrastChange(e.target.value)}
              onBlur={handleMinContrastBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="input input-number"
            />
          </div>

          <div 
            className="control-group"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <label
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >Max Contrast</label>
            <input
              type="number"
              min="1"
              max="21"
              step="0.1"
              value={tempInputValues.maxContrast}
              onChange={(e) => handleMaxContrastChange(e.target.value)}
              onBlur={handleMaxContrastBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="input input-number"
            />
          </div>

          <div 
            className="control-group"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <label
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >Max Lightness</label>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={tempInputValues.maxLightness}
              onChange={(e) => handleMaxLightnessChange(e.target.value)}
              onBlur={handleMaxLightnessBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="input input-number"
            />
          </div>

          <div 
            className="control-group"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <label
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >Min Lightness</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={tempInputValues.minLightness}
              onChange={(e) => handleMinLightnessChange(e.target.value)}
              onBlur={handleMinLightnessBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
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
            paletteColors={colorSet.colors}
          />
        ))}
      </div>
    </section>
  );
}
