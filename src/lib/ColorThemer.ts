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
      colorCount: 11, // Standard Tailwind CSS shade count
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
    
    // Regenerate colors if base color, color count, or contrast/lightness bounds changed
    if (updates.baseColor || updates.colorCount || updates.minContrast !== undefined || 
        updates.maxContrast !== undefined || updates.minLightness !== undefined || 
        updates.maxLightness !== undefined) {
      this.generateColorSet(colorSet);
    }
    
    this.notifyColorSetsChange();
    this.saveToStorage();
  }



  private generateColorSet(colorSet: ColorSet) {
    // Only generate monochromatic colors with optional bounds
    const colors = this.generateMonochromatic(
      colorSet.baseColor, 
      colorSet.colorCount,
      colorSet.minContrast,
      colorSet.maxContrast,
      colorSet.minLightness,
      colorSet.maxLightness
    );
    
    // Validate and adjust colors to ensure they match their expected names
    const validatedColors = this.validateAndAdjustColors(colors);
    colorSet.colors = validatedColors;
  }

  // Color palette generation algorithms
  private generateMonochromatic(
    baseColor: string, 
    count: number, 
    minContrast?: number, 
    maxContrast?: number, 
    minLightness?: number, 
    maxLightness?: number
  ): string[] {
    const [h, s, l] = this.hexToHsl(baseColor);
    
    // Check if this is a neutral color (black, white, or gray)
    // Use a much lower threshold for saturation to preserve subtle hues
    const isNeutral = s < 5 || (l < 20) || (l > 80);
    
    if (isNeutral) {
      // For neutral colors, use the balanced lightness curve with bounds
      const lightnessValues = this.generateBalancedLightnessCurve(count, minLightness, maxLightness, l);
      return lightnessValues.map((lightness, index) => {
        // If this is the base color position, return the original base color
        const maxL = maxLightness ?? 95;
        const minL = minLightness ?? 5;
        
        // Handle edge cases where base color is outside the bounds
        let baseIndex: number;
        if (l <= minL) {
          // Base color is very dark, place it at the darkest position
          baseIndex = count - 1;
        } else if (l >= maxL) {
          // Base color is very light, place it at the lightest position
          baseIndex = 0;
        } else {
          // Base color is within bounds, calculate its position
          const basePosition = (maxL - l) / (maxL - minL);
          baseIndex = Math.round(basePosition * (count - 1));
        }
        
        if (index === baseIndex) {
          return baseColor; // Preserve the user's exact base color
        } else {
          // For neutral colors, preserve the hue and saturation of the base color
          // Only use pure gray if the base color is actually pure gray (saturation = 0)
          if (s === 0) {
            return this.hslToHex(0, 0, lightness);
          } else {
            return this.hslToHex(h, s, lightness);
          }
        }
      });
    } else {
      // For true monochromatic palettes, we need to preserve exact hue and saturation
      // Convert to a more manageable HSL representation and work from there
      const exactHue = Math.round(h);
      const exactSaturation = Math.round(s);
      
      // Always use lightness bounds for generation, regardless of contrast values
      // This ensures consistent behavior when user changes any of the four fields
      const lightnessValues = this.generateHSLBasedLightnessCurve(h, s, l, count, minLightness, maxLightness);
      
      // Generate colors that will maintain exact HSL values when displayed
      return lightnessValues.map((lightness, index) => {
        // If this is the base color position, return the original base color
        const maxL = maxLightness ?? 95;
        const minL = minLightness ?? 5;
        
        // Handle edge cases where base color is outside the bounds
        let baseIndex: number;
        if (l <= minL) {
          // Base color is very dark, place it at the darkest position
          baseIndex = count - 1;
        } else if (l >= maxL) {
          // Base color is very light, place it at the lightest position
          baseIndex = 0;
        } else {
          // Base color is within bounds, calculate its position
          const basePosition = (maxL - l) / (maxL - minL);
          baseIndex = Math.round(basePosition * (count - 1));
        }
        
        if (index === baseIndex) {
          return baseColor; // Preserve the user's exact base color
        } else {
          // Find the best hex color that produces the desired rounded HSL values
          return this.generateExactHSLColor(exactHue, exactSaturation, Math.round(lightness));
        }
      });
    }
  }

  // Generate a balanced lightness curve with even distribution
  private generateBalancedLightnessCurve(count: number, minLightness?: number, maxLightness?: number, baseLightness?: number): number[] {
    // Use the same even distribution approach for all color types
    // This ensures consistent spacing regardless of whether it's neutral or colored
    
    const maxL = maxLightness ?? 95; // Lightest shade
    const minL = minLightness ?? 5;  // Darkest shade
    
    // If we only have one color, return the base lightness
    if (count === 1) {
      return [baseLightness ?? 50];
    }
    
    // If base lightness is provided, preserve it
    if (baseLightness !== undefined) {
      // Handle edge cases where base color is outside the bounds
      let baseIndex: number;
      
      if (baseLightness <= minL) {
        // Base color is very dark, place it at the darkest position
        baseIndex = count - 1;
      } else if (baseLightness >= maxL) {
        // Base color is very light, place it at the lightest position
        baseIndex = 0;
      } else {
        // Base color is within bounds, calculate its position
        const basePosition = (maxL - baseLightness) / (maxL - minL);
        baseIndex = Math.round(basePosition * (count - 1));
      }
      
      const lightnessValues: number[] = [];
      
      for (let i = 0; i < count; i++) {
        let lightness: number;
        
        if (i === baseIndex) {
          // Preserve the user's exact base color
          lightness = baseLightness;
        } else {
          // Generate other shades around the base color
          const position = i / (count - 1);
          const totalRange = maxL - minL;
          lightness = maxL - (position * totalRange);
        }
        
        lightnessValues.push(lightness);
      }
      
      return lightnessValues;
    }
    
    // Fallback to original behavior if no base lightness provided
    const totalRange = maxL - minL;
    const lightnessValues: number[] = [];
    
    for (let i = 0; i < count; i++) {
      // Calculate position from 0 to 1
      const position = i / (count - 1);
      
      // Linear interpolation for perfectly even distribution
      const lightness = maxL - (position * totalRange);
      
      lightnessValues.push(lightness);
    }
    
    return lightnessValues;
  }

  // Tailwind weight calculation moved to shared utils and duplicated in UI usage

  // Generate HSL-based lightness curve with even distribution
  // Preserves the user's base color and generates other shades around it
  private generateHSLBasedLightnessCurve(
    hue: number, 
    saturation: number, 
    baseLightness: number, 
    count: number, 
    minLightness?: number, 
    maxLightness?: number
  ): number[] {
    const maxL = maxLightness ?? 95; // Lightest shade
    const minL = minLightness ?? 5;  // Darkest shade
    
    // If we only have one color, return the base lightness
    if (count === 1) {
      return [baseLightness];
    }
    
    // Handle edge cases where base color is outside the bounds
    let adjustedBaseLightness = baseLightness;
    let baseIndex: number;
    
    if (baseLightness <= minL) {
      // Base color is very dark, place it at the darkest position
      adjustedBaseLightness = minL;
      baseIndex = count - 1;
    } else if (baseLightness >= maxL) {
      // Base color is very light, place it at the lightest position
      adjustedBaseLightness = maxL;
      baseIndex = 0;
    } else {
      // Base color is within bounds, calculate its position
      const basePosition = (maxL - baseLightness) / (maxL - minL);
      baseIndex = Math.round(basePosition * (count - 1));
    }
    
    const lightnessValues: number[] = [];
    
    for (let i = 0; i < count; i++) {
      let lightness: number;
      
      if (i === baseIndex) {
        // Preserve the user's exact base color (not the adjusted one)
        lightness = baseLightness;
      } else {
        // Generate other shades around the base color
        const position = i / (count - 1);
        lightness = maxL - (position * (maxL - minL));
      }
      
      lightnessValues.push(lightness);
    }
    
    return lightnessValues;
  }

  // Generate contrast-based lightness curve
  private generateContrastBasedLightnessCurve(
    hue: number, 
    saturation: number, 
    count: number, 
    minContrast?: number, 
    maxContrast?: number
  ): number[] {
    const minC = minContrast ?? 1.05; // Minimum contrast ratio
    const maxC = maxContrast ?? 19.5; // Maximum contrast ratio
    
    const lightnessValues: number[] = [];
    
    for (let i = 0; i < count; i++) {
      // Calculate position from 0 to 1
      const position = i / (count - 1);
      
      // Interpolate contrast ratio between min and max
      const targetContrast = minC + (position * (maxC - minC));
      
      // Find the lightness that gives us the target contrast ratio
      const lightness = this.findLightnessForContrast(hue, saturation, targetContrast);
      
      lightnessValues.push(lightness);
    }
    
    return lightnessValues;
  }

  // Generate harmonious lightness progression with smooth transitions
  private generateHarmoniousLightnessProgression(count: number, shade50Lightness: number, shade100Lightness: number, minLightness: number): number[] {
    const lightnessValues: number[] = [];
    
    // Calculate the total lightness range available
    const totalRange = shade50Lightness - minLightness;
    
    // Create a perceptually uniform distribution using a carefully tuned curve
    for (let i = 0; i < count; i++) {
      const normalizedPosition = i / (count - 1); // 0 to 1
      
      let lightness: number;
      
      if (i === 0) {
        // First shade should be very light (shade 50 equivalent)
        lightness = shade50Lightness;
      } else if (i === 1 && count > 3) {
        // Second shade should be close to first for smooth transition (shade 100 equivalent)
        lightness = shade100Lightness;
      } else {
        // For remaining shades, use a carefully crafted curve that ensures even distribution
        // Adjust the starting position to account for the first two fixed shades
        const adjustedPosition = count > 3 ? (normalizedPosition - (2 / (count - 1))) / (1 - (2 / (count - 1))) : normalizedPosition;
        const clampedPosition = Math.max(0, Math.min(1, adjustedPosition));
        
        // Use a combination of curves for different parts of the range
        let curveValue: number;
        
        if (clampedPosition < 0.4) {
          // Light to medium range: gentle curve
          const t = clampedPosition / 0.4;
          curveValue = Math.pow(t, 1.2);
        } else if (clampedPosition < 0.7) {
          // Medium range: linear for even distribution
          const t = (clampedPosition - 0.4) / 0.3;
          curveValue = 0.4 + (t * 0.3);
        } else {
          // Medium to dark range: steeper curve
          const t = (clampedPosition - 0.7) / 0.3;
          curveValue = 0.7 + (Math.pow(t, 0.8) * 0.3);
        }
        
        // Calculate lightness based on curve
        if (count > 3) {
          const remainingRange = shade100Lightness - minLightness;
          lightness = shade100Lightness - (curveValue * remainingRange);
        } else {
          lightness = shade50Lightness - (curveValue * totalRange);
        }
      }
      
      // Ensure we stay within reasonable bounds
      lightness = Math.max(minLightness, Math.min(shade50Lightness, lightness));
      lightnessValues.push(lightness);
    }
    
    // Post-process to ensure no two adjacent shades are too close or too far apart
    for (let i = 1; i < lightnessValues.length; i++) {
      const diff = lightnessValues[i - 1] - lightnessValues[i];
      const minDiff = totalRange / (count * 2); // Minimum difference
      const maxDiff = totalRange / (count * 0.5); // Maximum difference
      
      if (diff < minDiff) {
        // Shades too close, increase the difference
        lightnessValues[i] = lightnessValues[i - 1] - minDiff;
      } else if (diff > maxDiff) {
        // Shades too far apart, reduce the difference
        lightnessValues[i] = lightnessValues[i - 1] - maxDiff;
      }
      
      // Ensure bounds
      lightnessValues[i] = Math.max(minLightness, Math.min(lightnessValues[i - 1] - 0.5, lightnessValues[i]));
    }
    
    return lightnessValues;
  }

  // Easing function for smoother transitions
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Calculate dynamic shade 100 based on base color characteristics
  private calculateDynamicShade100(hue: number, saturation: number, baseLightness: number, shade50Lightness: number): number {
    // Calculate the ideal step size based on various factors
    
    // Factor 1: Base color lightness - darker base colors need smaller steps
    const lightnessRatio = baseLightness / 100;
    const lightnessAdjustment = 1 - (lightnessRatio * 0.3); // 0.7 to 1.0 range
    
    // Factor 2: Saturation - higher saturation colors can handle slightly larger steps
    const saturationRatio = saturation / 100;
    const saturationAdjustment = 0.8 + (saturationRatio * 0.4); // 0.8 to 1.2 range
    
    // Factor 3: Hue-based adjustment - some hues are more sensitive to lightness changes
    let hueAdjustment = 1.0;
    if (hue >= 45 && hue <= 75) {
      // Yellow range - more sensitive, use smaller steps
      hueAdjustment = 0.7;
    } else if (hue >= 240 && hue <= 270) {
      // Blue range - can handle slightly larger steps
      hueAdjustment = 1.1;
    } else if (hue >= 120 && hue <= 150) {
      // Green range - balanced
      hueAdjustment = 0.9;
    }
    
    // Calculate base step size (percentage points of lightness) - smaller for better harmony
    const baseStepSize = 2.5; // Reduced from 4% for gentler transition
    const dynamicStepSize = baseStepSize * lightnessAdjustment * saturationAdjustment * hueAdjustment;
    
    // Calculate target lightness for shade 100
    let shade100Lightness = shade50Lightness - dynamicStepSize;
    
    // Ensure we don't create too small or too large a gap - tighter bounds for harmony
    const minStep = 1.5; // Minimum 1.5% lightness difference
    const maxStep = 4; // Maximum 4% lightness difference (reduced from 8%)
    const actualStep = shade50Lightness - shade100Lightness;
    
    if (actualStep < minStep) {
      shade100Lightness = shade50Lightness - minStep;
    } else if (actualStep > maxStep) {
      shade100Lightness = shade50Lightness - maxStep;
    }
    
    // Ensure we stay within reasonable bounds (don't go below 75% lightness for shade 100)
    shade100Lightness = Math.max(75, Math.min(shade50Lightness - 1, shade100Lightness));
    
    return shade100Lightness;
  }

  // Create even smoother progressions by interpolating between key color points
  private generateSmoothColorProgression(baseColor: string, count: number): string[] {
    const [h, s] = this.hexToHsl(baseColor);
    const colors: string[] = [];
    
    // Define key color points for interpolation
    const keyPoints = [
      { lightness: 5, saturation: s * 0.3 },   // Very light
      { lightness: 15, saturation: s * 0.6 },  // Light
      { lightness: 30, saturation: s * 0.9 },  // Medium-light
      { lightness: 50, saturation: s * 1.1 },  // Medium (peak saturation)
      { lightness: 70, saturation: s * 0.9 },  // Medium-dark
      { lightness: 85, saturation: s * 0.6 },  // Dark
      { lightness: 95, saturation: s * 0.3 }   // Very dark
    ];
    
    for (let i = 0; i < count; i++) {
      const normalizedIndex = i / (count - 1);
      
      // Find the two key points to interpolate between
      const pointIndex = normalizedIndex * (keyPoints.length - 1);
      const lowerIndex = Math.floor(pointIndex);
      const upperIndex = Math.min(lowerIndex + 1, keyPoints.length - 1);
      const fraction = pointIndex - lowerIndex;
      
      const lowerPoint = keyPoints[lowerIndex];
      const upperPoint = keyPoints[upperIndex];
      
      // Interpolate between the key points
      const lightness = lowerPoint.lightness + (upperPoint.lightness - lowerPoint.lightness) * fraction;
      const saturation = lowerPoint.saturation + (upperPoint.saturation - lowerPoint.saturation) * fraction;
      
      // Apply bounds and adjustments
      const finalLightness = Math.max(3, Math.min(97, lightness));
      const finalSaturation = Math.max(20, Math.min(100, saturation));
      
      colors.push(this.hslToHex(h, finalSaturation, finalLightness));
    }
    
    return colors;
  }

  // Create perceptual color progressions using Lab color space for even smoother results
  private generatePerceptualColorProgression(baseColor: string, count: number): string[] {
    const colors: string[] = [];
    
    // Convert base color to Lab
    const labBase = this.hexToLab(baseColor);
    
    // Create a perceptual lightness curve that feels more natural
    const perceptualLightness = this.generatePerceptualLightnessCurve(count);
    
    for (let i = 0; i < count; i++) {
      const targetL = perceptualLightness[i];
      
      // Interpolate chroma (saturation) based on lightness for better harmony
      const chroma = this.calculatePerceptualChroma(labBase[1], labBase[2], targetL, i, count);
      
      // Create Lab color with interpolated values
      const labColor = [targetL, chroma * Math.cos(labBase[1] * Math.PI / 180), chroma * Math.sin(labBase[2] * Math.PI / 180)];
      
      // Convert back to hex
      colors.push(this.labToHex(labColor[0], labColor[1], labColor[2]));
    }
    
    return colors;
  }

  // Generate perceptual lightness curve that feels more natural to the eye
  private generatePerceptualLightnessCurve(count: number): number[] {
    const lightnessValues: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const normalizedIndex = i / (count - 1);
      
      // Use a curve that follows human perception more closely
      // This creates more balanced visual steps between shades
      // Fixed to go from light to dark (95% to 5%)
      let lightness: number;
      
      if (normalizedIndex < 0.3) {
        // Light shades: more gradual progression
        const t = normalizedIndex / 0.3;
        lightness = 95 - (t * 25); // 95% to 70%
      } else if (normalizedIndex < 0.7) {
        // Mid-tones: more variation for better distinction
        const t = (normalizedIndex - 0.3) / 0.4;
        lightness = 70 - (t * 40); // 70% to 30%
      } else {
        // Dark shades: steeper progression
        const t = (normalizedIndex - 0.7) / 0.3;
        lightness = 30 - (t * 25); // 30% to 5%
      }
      
      lightnessValues.push(lightness);
    }
    
    return lightnessValues;
  }

  // Calculate perceptual chroma (saturation) based on lightness
  private calculatePerceptualChroma(a: number, b: number, lightness: number, index: number, count: number): number {
    const baseChroma = Math.sqrt(a * a + b * b);
    
    // Create a bell curve for chroma that peaks in mid-tones
    const normalizedIndex = index / (count - 1);
    const chromaCurve = Math.sin(normalizedIndex * Math.PI) * 0.3; // 30% variation
    
    // Adjust chroma based on lightness for better harmony
    let lightnessAdjustment = 0;
    if (lightness < 20) {
      lightnessAdjustment = -0.2; // Reduce chroma for very dark shades
    } else if (lightness > 80) {
      lightnessAdjustment = 0.1; // Slightly increase chroma for very light shades
    }
    
    const finalChroma = baseChroma * (1 + chromaCurve + lightnessAdjustment);
    return Math.max(0, Math.min(128, finalChroma)); // Lab chroma bounds
  }

  // Improved saturation curve that creates more harmonious color progressions
  private calculateImprovedSaturationCurve(baseSaturation: number, index: number, totalCount: number, lightness: number): number {
    const normalizedIndex = index / (totalCount - 1);
    
    // Create a more sophisticated saturation curve
    const baseCurve = Math.sin(normalizedIndex * Math.PI) * 0.2; // 20% variation
    
    // Adjust based on lightness for better visual harmony
    let lightnessAdjustment = 0;
    if (lightness < 20) {
      // Very dark shades - reduce saturation slightly
      lightnessAdjustment = -15;
    } else if (lightness < 35) {
      // Dark shades - slight reduction
      lightnessAdjustment = -8;
    } else if (lightness > 80) {
      // Very light shades - increase saturation for better visibility
      lightnessAdjustment = 10;
    } else if (lightness > 65) {
      // Light shades - slight increase
      lightnessAdjustment = 5;
    }
    
    // Calculate final saturation
    const saturation = baseSaturation + (baseCurve * baseSaturation) + lightnessAdjustment;
    
    // Ensure minimum and maximum bounds
    const minSaturation = 20;
    const maxSaturation = Math.min(100, baseSaturation + 25);
    
    return Math.max(minSaturation, Math.min(maxSaturation, saturation));
  }

  // Generate target contrast ratios for any count, interpolating between base values
  private generateTargetContrasts(count: number, baseContrasts: number[]): number[] {
    if (count <= baseContrasts.length) {
      return baseContrasts.slice(0, count);
    }
    
    const targetContrasts: number[] = [];
    const step = (baseContrasts.length - 1) / (count - 1);
    
    for (let i = 0; i < count; i++) {
      const position = i * step;
      const lowerIndex = Math.floor(position);
      const upperIndex = Math.min(lowerIndex + 1, baseContrasts.length - 1);
      const fraction = position - lowerIndex;
      
      // Linear interpolation between base contrast values
      const lowerContrast = baseContrasts[lowerIndex];
      const upperContrast = baseContrasts[upperIndex];
      const interpolatedContrast = lowerContrast + (upperContrast - lowerContrast) * fraction;
      
      targetContrasts.push(interpolatedContrast);
    }
    
    return targetContrasts;
  }



  private validateAndAdjustColors(colors: string[]): string[] {
    // For monochromatic palettes, don't adjust colors at all
    // This ensures hue and saturation remain consistent
    return colors;
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



  // Generate a hex color that will produce exact HSL values when converted back
  private generateExactHSLColor(targetHue: number, targetSaturation: number, targetLightness: number): string {
    // Convert the target HSL to hex
    let bestHex = this.hslToHex(targetHue, targetSaturation, targetLightness);
    
    // Verify and adjust if needed to get exact HSL values
    const [resultH, resultS] = this.hexToHsl(bestHex);
    
    // If the conversion doesn't produce exact values, search for the best match
    if (Math.round(resultH) !== targetHue || Math.round(resultS) !== targetSaturation) {
      // Priority search: find hex that gives exact hue and saturation (lightness can vary slightly)
      let bestDiff = Infinity;
      let foundExactHS = false;
      const searchRange = 3; // Expanded search range
      
      for (let hAdj = -searchRange; hAdj <= searchRange; hAdj += 0.25) {
        for (let sAdj = -searchRange; sAdj <= searchRange; sAdj += 0.25) {
          for (let lAdj = -searchRange; lAdj <= searchRange; lAdj += 0.25) {
            const testHex = this.hslToHex(
              targetHue + hAdj, 
              Math.max(0, Math.min(100, targetSaturation + sAdj)), 
              Math.max(0, Math.min(100, targetLightness + lAdj))
            );
            const [testH, testS, testL] = this.hexToHsl(testHex);
            
            const hDiff = Math.abs(Math.round(testH) - targetHue);
            const sDiff = Math.abs(Math.round(testS) - targetSaturation);
            const lDiff = Math.abs(Math.round(testL) - targetLightness);
            
            // Prioritize exact hue and saturation match
            if (hDiff === 0 && sDiff === 0) {
              if (!foundExactHS || lDiff < bestDiff) {
                bestDiff = lDiff;
                bestHex = testHex;
                foundExactHS = true;
              }
            } else if (!foundExactHS) {
              // If no exact H,S match found yet, minimize total difference
              const totalDiff = hDiff * 10 + sDiff * 10 + lDiff; // Weight H,S more heavily
              if (totalDiff < bestDiff) {
                bestDiff = totalDiff;
                bestHex = testHex;
              }
            }
            
            // If we found a perfect H,S match with acceptable L, stop searching
            if (foundExactHS && lDiff <= 1) {
              break;
            }
          }
        }
      }
    }
    
    return bestHex;
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

  // Convert RGB to hex
  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Convert hex to Lab color space
  private hexToLab(hex: string): [number, number, number] {
    // First convert to RGB, then to XYZ, then to Lab
    const [r, g, b] = this.hexToRgb(hex);
    const [x, y, z] = this.rgbToXyz(r, g, b);
    return this.xyzToLab(x, y, z);
  }

  // Convert RGB to XYZ
  private rgbToXyz(r: number, g: number, b: number): [number, number, number] {
    // Normalize RGB values
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    // Apply gamma correction
    const rGamma = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
    const gGamma = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
    const bGamma = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;
    
    // Convert to XYZ
    const x = rGamma * 0.4124 + gGamma * 0.3576 + bGamma * 0.1805;
    const y = rGamma * 0.2126 + gGamma * 0.7152 + bGamma * 0.0722;
    const z = rGamma * 0.0193 + gGamma * 0.1192 + bGamma * 0.9505;
    
    return [x, y, z];
  }

  // Convert XYZ to Lab
  private xyzToLab(x: number, y: number, z: number): [number, number, number] {
    // D65 white point
    const xn = 0.95047;
    const yn = 1.0;
    const zn = 1.08883;
    
    const xr = this.xyzTransform(x / xn);
    const yr = this.xyzTransform(y / yn);
    const zr = this.xyzTransform(z / zn);
    
    const l = 116 * yr - 16;
    const a = 500 * (xr - yr);
    const b = 200 * (yr - zr);
    
    return [l, a, b];
  }

  // XYZ transform function
  private xyzTransform(t: number): number {
    return t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + (16 / 116);
  }

  // Convert Lab to hex
  private labToHex(l: number, a: number, b: number): string {
    const [x, y, z] = this.labToXyz(l, a, b);
    const [r, g, bVal] = this.xyzToRgb(x, y, z);
    return this.rgbToHex(r, g, bVal);
  }

  // Convert Lab to XYZ
  private labToXyz(l: number, a: number, b: number): [number, number, number] {
    const yr = (l + 16) / 116;
    const xr = yr + a / 500;
    const zr = yr - b / 200;
    
    const xn = 0.95047;
    const yn = 1.0;
    const zn = 1.08883;
    
    const x = xn * this.xyzInverseTransform(xr);
    const y = yn * this.xyzInverseTransform(yr);
    const z = zn * this.xyzInverseTransform(zr);
    
    return [x, y, z];
  }

  // XYZ inverse transform function
  private xyzInverseTransform(t: number): number {
    return t > 0.206897 ? Math.pow(t, 3) : (t - 16 / 116) / 7.787;
  }

  // Convert XYZ to RGB
  private xyzToRgb(x: number, y: number, z: number): [number, number, number] {
    const r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    const g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    const b = x * 0.0557 + y * -0.2040 + z * 1.0570;
    
    const rGamma = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
    const gGamma = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
    const bGamma = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
    
    return [
      Math.max(0, Math.min(255, Math.round(rGamma * 255))),
      Math.max(0, Math.min(255, Math.round(gGamma * 255))),
      Math.max(0, Math.min(255, Math.round(bGamma * 255)))
    ];
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
           set.baseColor === importedSet.baseColor)
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
