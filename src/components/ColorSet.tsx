'use client';

import { useState } from 'react';
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

  const handleBaseColorChange = (color: string) => {
    onUpdate(colorSet.id, { baseColor: color });
  };

  const handleColorCountChange = (count: number) => {
    onUpdate(colorSet.id, { colorCount: count });
  };

  // Helper function to calculate lightness from contrast
  const calculateLightnessFromContrast = (contrast: number, isMinContrast: boolean): number => {
    // For min contrast (low values like 1.05), we need high lightness (95%)
    // For max contrast (high values like 19.5), we need low lightness (5%)
    if (isMinContrast) {
      // Min contrast -> Max lightness
      // Lower contrast = higher lightness
      const normalizedContrast = Math.max(1, Math.min(21, contrast));
      const lightness = 95 - ((normalizedContrast - 1) * 4.5); // 1.05 -> 95%, 21 -> 5%
      return Math.max(5, Math.min(95, Math.round(lightness)));
    } else {
      // Max contrast -> Min lightness
      // Higher contrast = lower lightness
      const normalizedContrast = Math.max(1, Math.min(21, contrast));
      const lightness = 5 + ((21 - normalizedContrast) * 4.5); // 21 -> 5%, 1.05 -> 95%
      return Math.max(5, Math.min(95, Math.round(lightness)));
    }
  };

  // Helper function to calculate contrast from lightness
  const calculateContrastFromLightness = (lightness: number, isMaxLightness: boolean): number => {
    if (isMaxLightness) {
      // Max lightness -> Min contrast
      // Higher lightness = lower contrast
      const normalizedLightness = Math.max(5, Math.min(95, lightness));
      const contrast = 1 + ((95 - normalizedLightness) / 4.5); // 95% -> 1.05, 5% -> 21
      return Math.max(1.05, Math.min(21, Math.round(contrast * 100) / 100));
    } else {
      // Min lightness -> Max contrast
      // Lower lightness = higher contrast
      const normalizedLightness = Math.max(5, Math.min(95, lightness));
      const contrast = 21 - ((normalizedLightness - 5) / 4.5); // 5% -> 21, 95% -> 1.05
      return Math.max(1.05, Math.min(21, Math.round(contrast * 100) / 100));
    }
  };

  const handleMinContrastChange = (value: number | undefined) => {
    // Reset to default if cleared
    const finalValue = value !== undefined ? value : 1.05;
    const updates: Partial<ColorSetType> = { minContrast: finalValue };
    
    // Auto-update max lightness when min contrast changes
    const newMaxLightness = calculateLightnessFromContrast(finalValue, true);
    updates.maxLightness = newMaxLightness;
    
    onUpdate(colorSet.id, updates);
  };

  const handleMaxContrastChange = (value: number | undefined) => {
    // Reset to default if cleared
    const finalValue = value !== undefined ? value : 19.5;
    const updates: Partial<ColorSetType> = { maxContrast: finalValue };
    
    // Auto-update min lightness when max contrast changes
    const newMinLightness = calculateLightnessFromContrast(finalValue, false);
    updates.minLightness = newMinLightness;
    
    onUpdate(colorSet.id, updates);
  };

  const handleMinLightnessChange = (value: number | undefined) => {
    // Reset to default if cleared
    const finalValue = value !== undefined ? value : 5;
    const updates: Partial<ColorSetType> = { minLightness: finalValue };
    
    // Auto-update max contrast when min lightness changes
    const newMaxContrast = calculateContrastFromLightness(finalValue, false);
    updates.maxContrast = newMaxContrast;
    
    onUpdate(colorSet.id, updates);
  };

  const handleMaxLightnessChange = (value: number | undefined) => {
    // Reset to default if cleared
    const finalValue = value !== undefined ? value : 95;
    const updates: Partial<ColorSetType> = { maxLightness: finalValue };
    
    // Auto-update min contrast when max lightness changes
    const newMinContrast = calculateContrastFromLightness(finalValue, true);
    updates.minContrast = newMinContrast;
    
    onUpdate(colorSet.id, updates);
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
        <div 
          className="drag-handle" 
          title="Drag to reorder"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="8" r="1"/>
            <circle cx="16" cy="8" r="1"/>
            <circle cx="8" cy="16" r="1"/>
            <circle cx="16" cy="16" r="1"/>
          </svg>
        </div>
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
            <label>Shades</label>
            <input
              type="number"
              min="3"
              max="19"
              value={colorSet.colorCount}
              onChange={(e) => handleColorCountChange(parseInt(e.target.value))}
              className="input input-number"
            />
          </div>

          <div className="control-group">
            <label>Min Contrast</label>
            <input
              type="number"
              min="1"
              max="21"
              step="0.1"
              value={colorSet.minContrast || ''}
              onChange={(e) => handleMinContrastChange(parseFloat(e.target.value) || undefined)}
              placeholder="1.05"
              className="input input-number"
            />
          </div>

          <div className="control-group">
            <label>Max Contrast</label>
            <input
              type="number"
              min="1"
              max="21"
              step="0.1"
              value={colorSet.maxContrast || ''}
              onChange={(e) => handleMaxContrastChange(parseFloat(e.target.value) || undefined)}
              placeholder="19.5"
              className="input input-number"
            />
          </div>

          <div className="control-group">
            <label>Max Lightness</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={colorSet.maxLightness || ''}
              onChange={(e) => handleMaxLightnessChange(parseInt(e.target.value) || undefined)}
              placeholder="95"
              className="input input-number"
            />
          </div>

          <div className="control-group">
            <label>Min Lightness</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={colorSet.minLightness || ''}
              onChange={(e) => handleMinLightnessChange(parseInt(e.target.value) || undefined)}
              placeholder="5"
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
