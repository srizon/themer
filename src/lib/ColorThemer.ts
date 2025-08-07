import { ColorSet, ColorThemerCallbacks, ExportFormat, ColorFormat, ImportData } from '@/types/color';

export class ColorThemer {
  private colorSets: ColorSet[] = [];
  private currentExportFormat: ExportFormat = 'css';
  private currentColorFormat: ColorFormat = 'hex';
  private nextSetId = 1;
  private storageKey = 'colorThemerData';
  private callbacks: ColorThemerCallbacks;

  constructor(callbacks: ColorThemerCallbacks) {
    this.callbacks = callbacks;
    this.init();
  }

  private init() {
    this.loadFromStorage();
    
    // If no saved data, add the first color set
    if (this.colorSets.length === 0) {
      this.addColorSet();
    } else {
      // Ensure colors are generated if they're missing
      this.colorSets.forEach(colorSet => {
        if (!colorSet.colors || colorSet.colors.length === 0) {
          this.generateColorSet(colorSet);
        }
      });
      this.notifyColorSetsChange();
    }
  }

  private saveToStorage() {
    const data = {
      colorSets: this.colorSets,
      currentExportFormat: this.currentExportFormat,
      currentColorFormat: this.currentColorFormat,
      nextSetId: this.nextSetId,
      lastSaved: new Date().toISOString()
    };
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
          const data = JSON.parse(savedData);
          this.colorSets = data.colorSets || [];
          this.currentExportFormat = data.currentExportFormat || 'css';
          this.currentColorFormat = data.currentColorFormat || 'hex';
          this.nextSetId = data.nextSetId || 1;
        }
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      // Reset to defaults if loading fails
      this.colorSets = [];
      this.currentExportFormat = 'css';
      this.currentColorFormat = 'hex';
      this.nextSetId = 1;
    }
  }

  private notifyColorSetsChange() {
    this.callbacks.onColorSetsChange([...this.colorSets]);
  }

  private showNotification(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    if (this.callbacks.onNotification) {
      this.callbacks.onNotification(message, type);
    }
  }

  addColorSet() {
    const setId = this.nextSetId++;
    
    // Generate random color with better saturation and lightness for proper naming
    const hue = Math.random() * 360;
    const saturation = Math.random() * 60 + 40; // 40-100% saturation
    const lightness = Math.random() * 40 + 30; // 30-70% lightness
    const randomColor = this.hslToHex(hue, saturation, lightness);
    
    const colorSet: ColorSet = {
      id: setId,
      baseColor: randomColor,
      paletteType: 'monochromatic',
      colorCount: 11,
      colors: []
    };

    this.colorSets.push(colorSet);
    this.generateColorSet(colorSet);
    this.notifyColorSetsChange();
    this.saveToStorage();
  }

  removeColorSet(setId: number) {
    const index = this.colorSets.findIndex(set => set.id === setId);
    if (index !== -1) {
      this.colorSets.splice(index, 1);
      
      if (this.colorSets.length === 0) {
        this.addColorSet(); // Ensure at least one color set exists
      } else {
        this.notifyColorSetsChange();
        this.saveToStorage();
      }
    }
  }

  reorderColorSets(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= this.colorSets.length || toIndex >= this.colorSets.length) {
      return;
    }

    const [movedSet] = this.colorSets.splice(fromIndex, 1);
    this.colorSets.splice(toIndex, 0, movedSet);
    
    this.notifyColorSetsChange();
    this.saveToStorage();
  }

  updateColorSet(setId: number, updates: Partial<ColorSet>) {
    const colorSet = this.colorSets.find(set => set.id === setId);
    if (!colorSet) return;

    Object.assign(colorSet, updates);
    
    // Regenerate colors if base color or palette type changed
    if (updates.baseColor || updates.paletteType || updates.colorCount) {
      this.generateColorSet(colorSet);
    }
    
    this.notifyColorSetsChange();
    this.saveToStorage();
  }

  // Method to regenerate colors with improved contrast ratios
  regenerateWithBetterContrast(setId: number) {
    const colorSet = this.colorSets.find(set => set.id === setId);
    if (!colorSet) return;

    // Regenerate the color set with improved algorithms
    this.generateColorSet(colorSet);
    
    // Log contrast analysis for debugging
    this.debugContrastRatios(colorSet);
    
    this.notifyColorSetsChange();
    this.saveToStorage();
    
    this.showNotification('Colors regenerated with improved contrast ratios', 'success');
  }

  private generateColorSet(colorSet: ColorSet) {
    let colors: string[] = [];
    
    switch (colorSet.paletteType) {
      case 'monochromatic':
        colors = this.generateMonochromatic(colorSet.baseColor, colorSet.colorCount);
        break;
      case 'analogous':
        colors = this.generateAnalogous(colorSet.baseColor, colorSet.colorCount);
        break;
      case 'complementary':
        colors = this.generateComplementary(colorSet.baseColor, colorSet.colorCount);
        break;
      case 'triadic':
        colors = this.generateTriadic(colorSet.baseColor, colorSet.colorCount);
        break;
      case 'tetradic':
        colors = this.generateTetradic(colorSet.baseColor, colorSet.colorCount);
        break;
      case 'split-complementary':
        colors = this.generateSplitComplementary(colorSet.baseColor, colorSet.colorCount);
        break;
    }

    // Validate and adjust colors to ensure they match their expected names
    colors = this.validateAndAdjustColors(colors, colorSet.baseColor);
    colorSet.colors = colors;
  }

  // Color palette generation algorithms
  private generateMonochromatic(baseColor: string, count: number): string[] {
    const [h, s, l] = this.hexToHsl(baseColor);
    const colors: string[] = [];
    
    // Target contrast ratios for each shade based on Tailwind CSS standards
    // These create harmonious and evenly distributed contrast ratios
    const targetContrasts = [
      1.05,   // 50
      1.17,   // 100
      1.31,   // 200
      1.44,   // 300
      1.60,   // 400
      1.79,   // 500
      2.69,   // 600
      4.32,   // 700
      7.39,   // 800
      13.03,  // 900
      19.42   // 950
    ];
    
    // Generate colors with specific target contrast ratios
    for (let i = 0; i < count; i++) {
      const targetContrast = targetContrasts[i] || targetContrasts[targetContrasts.length - 1];
      const lightness = this.findLightnessForContrast(h, s, targetContrast);
      
      // Use a sophisticated saturation curve for more harmonious colors
      // Lighter shades get slightly higher saturation, darker shades get slightly lower
      const saturationCurve = this.calculateSaturationCurve(s, i, count);
      const color = this.hslToHex(h, saturationCurve, lightness);
      colors.push(color);
    }
    
    return colors;
  }

  private generateAnalogous(baseColor: string, count: number): string[] {
    const [h, s, l] = this.hexToHsl(baseColor);
    const colors: string[] = [];
    const hueRange = 60;
    
    for (let i = 0; i < count; i++) {
      const hueOffset = (i - count/2) * (hueRange / count);
      const newHue = (h + hueOffset + 360) % 360;
      const newSat = Math.max(35, Math.min(100, s + (Math.random() - 0.5) * 20));
      const newLight = Math.max(20, Math.min(80, l + (Math.random() - 0.5) * 40));
      colors.push(this.hslToHex(newHue, newSat, newLight));
    }
    
    return colors;
  }

  private generateComplementary(baseColor: string, count: number): string[] {
    const [h, s, l] = this.hexToHsl(baseColor);
    const colors: string[] = [];
    
    const halfCount = Math.ceil(count / 2);
    for (let i = 0; i < halfCount; i++) {
      const lightness = Math.max(20, Math.min(80, l + (i - halfCount/2) * (60/halfCount)));
      colors.push(this.hslToHex(h, s, lightness));
    }
    
    const compHue = (h + 180) % 360;
    for (let i = 0; i < count - halfCount; i++) {
      const lightness = Math.max(20, Math.min(80, l + (i - (count - halfCount)/2) * (60/(count - halfCount))));
      colors.push(this.hslToHex(compHue, s, lightness));
    }
    
    return colors;
  }

  private generateTriadic(baseColor: string, count: number): string[] {
    const [h, s, l] = this.hexToHsl(baseColor);
    const colors: string[] = [];
    const hues = [h, (h + 120) % 360, (h + 240) % 360];
    
    for (let i = 0; i < count; i++) {
      const hueIndex = i % 3;
      const baseHue = hues[hueIndex];
      const variation = Math.floor(i / 3);
      const lightness = Math.max(20, Math.min(80, l + (variation - 1) * 20));
      const saturation = Math.max(40, Math.min(100, s + (Math.random() - 0.5) * 20));
      colors.push(this.hslToHex(baseHue, saturation, lightness));
    }
    
    return colors;
  }

  private generateTetradic(baseColor: string, count: number): string[] {
    const [h, s, l] = this.hexToHsl(baseColor);
    const colors: string[] = [];
    const hues = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360];
    
    for (let i = 0; i < count; i++) {
      const hueIndex = i % 4;
      const baseHue = hues[hueIndex];
      const variation = Math.floor(i / 4);
      const lightness = Math.max(20, Math.min(80, l + (variation - 1) * 15));
      const saturation = Math.max(40, Math.min(100, s + (Math.random() - 0.5) * 20));
      colors.push(this.hslToHex(baseHue, saturation, lightness));
    }
    
    return colors;
  }

  private generateSplitComplementary(baseColor: string, count: number): string[] {
    const [h, s, l] = this.hexToHsl(baseColor);
    const colors: string[] = [];
    const hues = [h, (h + 150) % 360, (h + 210) % 360];
    
    for (let i = 0; i < count; i++) {
      const hueIndex = i % 3;
      const baseHue = hues[hueIndex];
      const variation = Math.floor(i / 3);
      const lightness = Math.max(20, Math.min(80, l + (variation - 1) * 20));
      const saturation = Math.max(40, Math.min(100, s + (Math.random() - 0.5) * 20));
      colors.push(this.hslToHex(baseHue, saturation, lightness));
    }
    
    return colors;
  }

  private validateAndAdjustColors(colors: string[], baseColor: string): string[] {
    const baseColorName = this.getBaseColorName(baseColor);
    const adjustedColors: string[] = [];
    
    colors.forEach((color) => {
      let adjustedColor = color;
      const [h, s, l] = this.hexToHsl(color);
      const colorName = this.getBaseColorName(color);
      
      if (colorName !== baseColorName && this.shouldAdjustColor(colorName, baseColorName)) {
        const baseHue = this.hexToHsl(baseColor)[0];
        const adjustedHue = this.adjustHueToMatchName(h, baseColorName);
        adjustedColor = this.hslToHex(adjustedHue, s, l);
      }
      
      if (s < 25 && l > 15 && l < 85) {
        const [adjH, , adjL] = this.hexToHsl(adjustedColor);
        adjustedColor = this.hslToHex(adjH, 25, adjL);
      }
      
      adjustedColors.push(adjustedColor);
    });
    
    return adjustedColors;
  }

  private shouldAdjustColor(colorName: string, baseColorName: string): boolean {
    if (['black', 'white', 'gray'].includes(colorName) || 
        ['black', 'white', 'gray'].includes(baseColorName)) {
      return false;
    }
    
    const colorFamilies = {
      'warm': ['red', 'orange', 'yellow'],
      'cool': ['green', 'cyan', 'blue'],
      'neutral': ['purple', 'pink']
    };
    
    for (const [, colors] of Object.entries(colorFamilies)) {
      if (colors.includes(colorName) && colors.includes(baseColorName)) {
        return false;
      }
    }
    
    return true;
  }

  private adjustHueToMatchName(hue: number, targetColorName: string): number {
    const targetHues = {
      'red': 0,
      'orange': 30,
      'yellow': 60,
      'green': 120,
      'cyan': 180,
      'blue': 240,
      'purple': 300,
      'pink': 330
    };
    
    const targetHue = targetHues[targetColorName as keyof typeof targetHues];
    if (targetHue === undefined) return hue;
    
    let diff = targetHue - hue;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return (hue + diff * 0.5 + 360) % 360;
  }

  private getBaseColorName(hex: string): string {
    const [h, s, l] = this.hexToHsl(hex);
    
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
  }

  private generatePaletteName(colorName: string, paletteType: string): string {
    const typeNames: Record<string, string> = {
      'monochromatic': '',
      'analogous': 'Harmony',
      'complementary': 'Contrast',
      'triadic': 'Balance',
      'tetradic': 'Vibrant',
      'split-complementary': 'Dynamic'
    };
    
    const typeName = typeNames[paletteType] || '';
    const baseName = colorName.charAt(0).toUpperCase() + colorName.slice(1);
    return typeName ? `${baseName} ${typeName}` : baseName;
  }

  // Color utility functions
  private hexToHsl(hex: string): [number, number, number] {
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
  }

  private hslToHex(h: number, s: number, l: number): string {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  private calculateLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private getContrastRatio(color1: string, color2: string = '#FFFFFF'): number {
    const [r1, g1, b1] = this.hexToRgb(color1);
    const [r2, g2, b2] = this.hexToRgb(color2);
    
    const luminance1 = this.calculateLuminance(r1, g1, b1);
    const luminance2 = this.calculateLuminance(r2, g2, b2);
    
    const maxLuminance = Math.max(luminance1, luminance2);
    const minLuminance = Math.min(luminance1, luminance2);
    
    return (maxLuminance + 0.05) / (minLuminance + 0.05);
  }

  private findLightnessForContrast(hue: number, saturation: number, targetContrast: number): number {
    // For very low contrast (like 1.05), we need a very light color
    // For very high contrast (like 19.5), we need a very dark color
    let bestLightness = 50;
    let bestDiff = Infinity;
    
    // Use a more comprehensive grid search for better accuracy
    // Adjust step size based on target contrast for better precision
    const stepSize = targetContrast < 2 ? 0.2 : targetContrast < 5 ? 0.5 : 1;
    
    for (let l = 0; l <= 100; l += stepSize) {
      const testColor = this.hslToHex(hue, saturation, l);
      const contrast = this.getContrastRatio(testColor);
      const diff = Math.abs(contrast - targetContrast);
      
      if (diff < bestDiff) {
        bestDiff = diff;
        bestLightness = l;
      }
      
      // If we're very close, we can stop early
      if (diff < 0.01) break;
    }
    
    // Refine the result with a finer search around the best value
    if (bestDiff > 0.05) {
      const refineRange = stepSize * 2;
      const startL = Math.max(0, bestLightness - refineRange);
      const endL = Math.min(100, bestLightness + refineRange);
      
      for (let l = startL; l <= endL; l += 0.1) {
        const testColor = this.hslToHex(hue, saturation, l);
        const contrast = this.getContrastRatio(testColor);
        const diff = Math.abs(contrast - targetContrast);
        
        if (diff < bestDiff) {
          bestDiff = diff;
          bestLightness = l;
        }
        
        if (diff < 0.005) break;
      }
    }
    
    return Math.max(1, Math.min(99, bestLightness));
  }

  private calculateSaturationCurve(baseSaturation: number, index: number, totalCount: number): number {
    // Create a bell curve for saturation that peaks in the middle shades
    // This creates more vibrant mid-tones and slightly muted extremes
    const normalizedIndex = index / (totalCount - 1);
    const curve = Math.sin(normalizedIndex * Math.PI) * 0.15; // 15% variation
    
    // Ensure minimum saturation for very light/dark shades
    const minSaturation = 25;
    const maxSaturation = Math.min(100, baseSaturation + 20);
    
    let saturation = baseSaturation + (curve * baseSaturation);
    
    // Apply additional adjustments for extreme shades
    if (normalizedIndex < 0.2) {
      // Very light shades - slightly increase saturation for better visibility
      saturation += 5;
    } else if (normalizedIndex > 0.8) {
      // Very dark shades - slightly decrease saturation for better harmony
      saturation -= 10;
    }
    
    return Math.max(minSaturation, Math.min(maxSaturation, saturation));
  }

  private hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  // Export functionality
  exportAllPalettes() {
    if (this.colorSets.length === 0) {
      this.showNotification('No palettes to export', 'warning');
      return;
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      colorSets: this.colorSets,
      metadata: {
        totalPalettes: this.colorSets.length,
        totalColors: this.colorSets.reduce((sum, set) => sum + set.colors.length, 0)
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `color-palettes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
    this.showNotification('All palettes exported successfully', 'success');
  }

  importPalettes() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          this.callbacks.onImportModalOpen(importData);
        } catch (error) {
          console.error('Error parsing import file:', error);
          this.showNotification('Invalid file format. Please select a valid export file.', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  processImport(importData: ImportData, shouldMerge: boolean) {
    let importedCount = 0;
    let skippedCount = 0;

    if (shouldMerge) {
      importData.colorSets.forEach((importedSet: ColorSet) => {
        const existingSet = this.colorSets.find(set => 
          (set.customName && set.customName === importedSet.customName) ||
          (!set.customName && !importedSet.customName && 
           set.baseColor === importedSet.baseColor && 
           set.paletteType === importedSet.paletteType)
        );

        if (existingSet) {
          skippedCount++;
        } else {
          importedSet.id = this.nextSetId++;
          this.colorSets.push(importedSet);
          importedCount++;
        }
      });
    } else {
      this.colorSets = [];
      this.nextSetId = 1;
      
      importData.colorSets.forEach((importedSet: ColorSet) => {
        importedSet.id = this.nextSetId++;
        this.colorSets.push(importedSet);
        importedCount++;
      });
    }

    this.colorSets.forEach(colorSet => {
      if (!colorSet.colors || colorSet.colors.length === 0) {
        this.generateColorSet(colorSet);
      }
    });

    this.notifyColorSetsChange();
    this.saveToStorage();

    let message = `Successfully imported ${importedCount} palette${importedCount !== 1 ? 's' : ''}`;
    if (skippedCount > 0) {
      message += ` (${skippedCount} duplicate${skippedCount !== 1 ? 's' : ''} skipped)`;
    }
    this.showNotification(message, 'success');
  }

  clearAllData() {
    if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(this.storageKey);
        }
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
      
      this.colorSets = [];
      this.currentExportFormat = 'css';
      this.nextSetId = 1;
      
      this.addColorSet();
      this.showNotification('All data cleared and reset to defaults', 'success');
    }
  }

  // Getters for external access
  getColorSets(): ColorSet[] {
    return [...this.colorSets];
  }

  getCurrentExportFormat(): ExportFormat {
    return this.currentExportFormat;
  }

  getCurrentColorFormat(): ColorFormat {
    return this.currentColorFormat;
  }

  setCurrentExportFormat(format: ExportFormat) {
    this.currentExportFormat = format;
    this.saveToStorage();
  }

  setCurrentColorFormat(format: ColorFormat) {
    this.currentColorFormat = format;
    this.saveToStorage();
  }

  // Debug method to test contrast ratios
  getContrastRatioForColor(color: string): number {
    return this.getContrastRatio(color);
  }

  // Method to validate contrast ratios for a color set
  validateContrastRatios(colorSet: ColorSet): { shade: string; expected: number; actual: number; difference: number }[] {
    const results = [];
    const shadeNames = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    const expectedContrasts = [1.05, 1.17, 1.31, 1.44, 1.60, 1.79, 2.69, 4.32, 7.39, 13.03, 19.42];
    
    for (let i = 0; i < colorSet.colors.length && i < expectedContrasts.length; i++) {
      const actualContrast = this.getContrastRatio(colorSet.colors[i]);
      const expectedContrast = expectedContrasts[i];
      const difference = Math.abs(actualContrast - expectedContrast);
      
      results.push({
        shade: shadeNames[i] || `${i * 100}`,
        expected: expectedContrast,
        actual: actualContrast,
        difference: difference
      });
    }
    
    return results;
  }

  // Debug method to log contrast ratios for a color set
  debugContrastRatios(colorSet: ColorSet): void {
    const validation = this.validateContrastRatios(colorSet);
    console.log('Contrast Ratio Analysis for:', colorSet.baseColor);
    console.table(validation.map(v => ({
      Shade: v.shade,
      Expected: v.expected.toFixed(2),
      Actual: v.actual.toFixed(2),
      Difference: v.difference.toFixed(3),
      Status: v.difference < 0.1 ? '✅' : v.difference < 0.3 ? '⚠️' : '❌'
    })));
  }
}
