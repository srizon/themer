// Shared color and palette utilities

export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function calculateLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const channel = c / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastBetween(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = calculateLuminance(r1, g1, b1);
  const l2 = calculateLuminance(r2, g2, b2);
  const maxL = Math.max(l1, l2);
  const minL = Math.min(l1, l2);
  return (maxL + 0.05) / (minL + 0.05);
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return [h, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let rP = 0,
    gP = 0,
    bP = 0;
  if (0 <= h && h < 60) {
    rP = c;
    gP = x;
    bP = 0;
  } else if (60 <= h && h < 120) {
    rP = x;
    gP = c;
    bP = 0;
  } else if (120 <= h && h < 180) {
    rP = 0;
    gP = c;
    bP = x;
  } else if (180 <= h && h < 240) {
    rP = 0;
    gP = x;
    bP = c;
  } else if (240 <= h && h < 300) {
    rP = 0;
    gP = 0;
    bP = x;
  } else {
    rP = c;
    gP = 0;
    bP = x;
  }
  const r = Math.round((rP + m) * 255);
  const g = Math.round((gP + m) * 255);
  const b = Math.round((bP + m) * 255);
  const toHex = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function calculateTailwindWeight(index: number, total: number): number {
  if (total <= 11) {
    if (total === 11) return [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
    if (total === 10) return [50, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
    if (total === 9) return [50, 200, 300, 400, 500, 600, 700, 800, 950][index];
    if (total === 8) return [50, 300, 400, 500, 600, 700, 800, 950][index];
    if (total === 7) return [50, 300, 400, 500, 600, 700, 950][index];
    if (total === 6) return [50, 400, 500, 600, 700, 950][index];
    if (total === 5) return [50, 400, 500, 600, 950][index];
    if (total === 4) return [50, 500, 600, 950][index];
    if (total === 3) return [50, 500, 950][index];
    if (total === 2) return [50, 950][index];
    return 500;
  }

  if (total === 12) return [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950][index];
  if (total === 13) return [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950][index];
  if (total === 14)
    return [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 950][index];
  if (total === 15)
    return [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950][index];
  if (total === 16)
    return [50, 100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 750, 800, 850, 900, 950][index];
  if (total === 17)
    return [50, 100, 150, 200, 250, 300, 350, 400, 500, 600, 650, 700, 750, 800, 850, 900, 950][index];
  if (total === 18)
    return [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 650, 700, 750, 800, 850, 900, 950][index];
  if (total === 19)
    return [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950][index];

  // 20+
  return (
    [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950][index] || 500
  );
}

/**
 * Enhanced color naming function that provides descriptive and interesting color names
 * based on hue, saturation, and lightness values
 */
export function getEnhancedColorName(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  
  // Handle achromatic colors (low saturation)
  if (s < 15) {
    if (l < 5) return 'Obsidian';
    if (l < 10) return 'Charcoal';
    if (l < 15) return 'Graphite';
    if (l < 20) return 'Gunmetal';
    if (l < 25) return 'Slate';
    if (l < 30) return 'Iron';
    if (l < 35) return 'Storm Cloud';
    if (l < 40) return 'Ash';
    if (l < 45) return 'Pewter';
    if (l < 50) return 'Steel Gray';
    if (l < 55) return 'Silver Mist';
    if (l < 60) return 'Platinum';
    if (l < 65) return 'Dove Gray';
    if (l < 70) return 'Moonstone';
    if (l < 75) return 'Pearl';
    if (l < 80) return 'Fog';
    if (l < 85) return 'Whisper';
    if (l < 90) return 'Porcelain';
    if (l < 95) return 'Cloud White';
    return 'Snow';
  }
  
  // Handle very dark colors
  if (l < 15) {
    if (h >= 0 && h < 20) return 'Midnight Wine';
    if (h >= 20 && h < 40) return 'Dark Espresso';
    if (h >= 40 && h < 60) return 'Burnt Umber';
    if (h >= 60 && h < 80) return 'Forest Shadow';
    if (h >= 80 && h < 120) return 'Deep Forest';
    if (h >= 120 && h < 150) return 'Evergreen';
    if (h >= 150 && h < 180) return 'Abyssal Teal';
    if (h >= 180 && h < 210) return 'Abyss Blue';
    if (h >= 210 && h < 240) return 'Midnight Blue';
    if (h >= 240 && h < 270) return 'Royal Navy';
    if (h >= 270 && h < 300) return 'Midnight Purple';
    if (h >= 300 && h < 330) return 'Dark Plum';
    if (h >= 330 && h < 360) return 'Dark Cherry';
    return 'Void';
  }
  
  // Handle very light colors
  if (l > 85) {
    if (h >= 0 && h < 20) return 'Rose Quartz';
    if (h >= 20 && h < 40) return 'Champagne';
    if (h >= 40 && h < 60) return 'Cream';
    if (h >= 60 && h < 80) return 'Vanilla';
    if (h >= 80 && h < 120) return 'Mint Cream';
    if (h >= 120 && h < 150) return 'Seafoam';
    if (h >= 150 && h < 180) return 'Aqua Mist';
    if (h >= 180 && h < 210) return 'Ice Blue';
    if (h >= 210 && h < 240) return 'Powder Blue';
    if (h >= 240 && h < 270) return 'Alice Blue';
    if (h >= 270 && h < 300) return 'Lavender Mist';
    if (h >= 300 && h < 330) return 'Thistle';
    if (h >= 330 && h < 360) return 'Blush Pink';
    return 'Cotton';
  }
  
  // Enhanced color names based on hue ranges with more variety
  let baseNames: string[] = [];
  
  // Red range (0-30°)
  if (h >= 0 && h < 15) {
    if (s > 70) baseNames = ['Crimson', 'Ruby', 'Cardinal', 'Vermillion'];
    else if (l > 60) baseNames = ['Rose', 'Blush', 'Salmon', 'Coral'];
    else baseNames = ['Wine', 'Burgundy', 'Maroon', 'Claret'];
  } else if (h >= 15 && h < 30) {
    if (s > 70) baseNames = ['Scarlet', 'Fire Engine', 'Cherry Red', 'Flame'];
    else if (l > 60) baseNames = ['Coral', 'Peach', 'Apricot', 'Sunset'];
    else baseNames = ['Burgundy', 'Brick', 'Rust', 'Terra Cotta'];
  }
  
  // Orange range (30-60°)
  else if (h >= 30 && h < 45) {
    if (s > 70) baseNames = ['Tangerine', 'Orange Peel', 'Mandarin', 'Pumpkin'];
    else if (l > 60) baseNames = ['Peach', 'Papaya', 'Melon', 'Cantaloupe'];
    else baseNames = ['Rust', 'Copper', 'Auburn', 'Sienna'];
  } else if (h >= 45 && h < 60) {
    if (s > 70) baseNames = ['Amber', 'Marigold', 'Saffron', 'Turmeric'];
    else if (l > 60) baseNames = ['Honey', 'Cream', 'Wheat', 'Sandstone'];
    else baseNames = ['Bronze', 'Caramel', 'Cognac', 'Toffee'];
  }
  
  // Yellow range (60-90°)
  else if (h >= 60 && h < 75) {
    if (s > 70) baseNames = ['Golden', 'Sunflower', 'Lemon', 'Canary'];
    else if (l > 60) baseNames = ['Butter', 'Cream', 'Ivory', 'Champagne'];
    else baseNames = ['Olive', 'Mustard', 'Khaki', 'Brass'];
  } else if (h >= 75 && h < 90) {
    if (s > 70) baseNames = ['Lime', 'Chartreuse', 'Electric Lime', 'Neon Green'];
    else if (l > 60) baseNames = ['Sage', 'Mint', 'Pistachio', 'Celery'];
    else baseNames = ['Forest', 'Olive', 'Army Green', 'Moss'];
  }
  
  // Green range (90-150°)
  else if (h >= 90 && h < 105) {
    if (s > 70) baseNames = ['Lime', 'Spring Green', 'Electric Green', 'Neon'];
    else if (l > 60) baseNames = ['Sage', 'Mint', 'Tea Green', 'Honeydew'];
    else baseNames = ['Forest', 'Hunter', 'Pine', 'Juniper'];
  } else if (h >= 105 && h < 120) {
    if (s > 70) baseNames = ['Emerald', 'Malachite', 'Jade', 'Kelly Green'];
    else if (l > 60) baseNames = ['Mint', 'Seafoam', 'Celadon', 'Lichen'];
    else baseNames = ['Pine', 'Evergreen', 'Fern', 'Ivy'];
  } else if (h >= 120 && h < 135) {
    if (s > 70) baseNames = ['Jade', 'Forest Green', 'Shamrock', 'Clover'];
    else if (l > 60) baseNames = ['Seafoam', 'Mint Chip', 'Eucalyptus', 'Sage'];
    else baseNames = ['Hunter', 'Forest', 'Bottle Green', 'Deep Green'];
  } else if (h >= 135 && h < 150) {
    if (s > 70) baseNames = ['Jade', 'Sea Green', 'Teal Green', 'Viridian'];
    else if (l > 60) baseNames = ['Seafoam', 'Aqua Mint', 'Sea Glass', 'Mint Green'];
    else baseNames = ['Hunter', 'Teal', 'Petrol', 'Dark Teal'];
  }
  
  // Cyan/Teal range (150-180°)
  else if (h >= 150 && h < 165) {
    if (s > 70) baseNames = ['Turquoise', 'Aqua', 'Cyan', 'Caribbean'];
    else if (l > 60) baseNames = ['Aqua', 'Mint', 'Sea Glass', 'Robin Egg'];
    else baseNames = ['Teal', 'Petrol', 'Deep Sea', 'Pine Green'];
  } else if (h >= 165 && h < 180) {
    if (s > 70) baseNames = ['Aqua', 'Turquoise', 'Electric Blue', 'Neon Blue'];
    else if (l > 60) baseNames = ['Turquoise', 'Aqua Mist', 'Baby Blue', 'Robin Egg'];
    else baseNames = ['Teal', 'Steel Blue', 'Peacock', 'Deep Teal'];
  }
  
  // Blue range (180-240°)
  else if (h >= 180 && h < 195) {
    if (s > 70) baseNames = ['Cyan', 'Electric Blue', 'Neon Blue', 'Bright Blue'];
    else if (l > 60) baseNames = ['Sky Blue', 'Baby Blue', 'Powder Blue', 'Periwinkle'];
    else baseNames = ['Steel', 'Slate Blue', 'Storm Blue', 'Denim'];
  } else if (h >= 195 && h < 210) {
    if (s > 70) baseNames = ['Azure', 'Cerulean', 'Dodger Blue', 'Electric Blue'];
    else if (l > 60) baseNames = ['Periwinkle', 'Cornflower', 'Sky Blue', 'Powder Blue'];
    else baseNames = ['Denim', 'Steel Blue', 'Slate', 'Storm'];
  } else if (h >= 210 && h < 225) {
    if (s > 70) baseNames = ['Royal Blue', 'Cobalt', 'Sapphire', 'Electric Blue'];
    else if (l > 60) baseNames = ['Cornflower', 'Periwinkle', 'Lavender Blue', 'Sky Blue'];
    else baseNames = ['Navy', 'Midnight Blue', 'Prussian Blue', 'Dark Blue'];
  } else if (h >= 225 && h < 240) {
    if (s > 70) baseNames = ['Sapphire', 'Royal Blue', 'Ultramarine', 'Cobalt'];
    else if (l > 60) baseNames = ['Cornflower', 'Periwinkle', 'Lavender', 'Lilac'];
    else baseNames = ['Navy', 'Midnight', 'Prussian', 'Oxford Blue'];
  }
  
  // Purple range (240-300°)
  else if (h >= 240 && h < 255) {
    if (s > 70) baseNames = ['Blue Violet', 'Electric Purple', 'Ultramarine', 'Royal Purple'];
    else if (l > 60) baseNames = ['Periwinkle', 'Lavender', 'Lilac', 'Wisteria'];
    else baseNames = ['Indigo', 'Navy Purple', 'Dark Violet', 'Midnight Purple'];
  } else if (h >= 255 && h < 270) {
    if (s > 70) baseNames = ['Indigo', 'Electric Purple', 'Violet', 'Purple'];
    else if (l > 60) baseNames = ['Lilac', 'Lavender', 'Periwinkle', 'Amethyst'];
    else baseNames = ['Eggplant', 'Dark Purple', 'Plum', 'Aubergine'];
  } else if (h >= 270 && h < 285) {
    if (s > 70) baseNames = ['Violet', 'Purple', 'Electric Violet', 'Neon Purple'];
    else if (l > 60) baseNames = ['Plum', 'Lavender', 'Thistle', 'Orchid'];
    else baseNames = ['Mulberry', 'Eggplant', 'Deep Purple', 'Plum'];
  } else if (h >= 285 && h < 300) {
    if (s > 70) baseNames = ['Purple', 'Magenta Purple', 'Royal Purple', 'Amethyst'];
    else if (l > 60) baseNames = ['Plum', 'Orchid', 'Mauve', 'Lilac'];
    else baseNames = ['Mulberry', 'Wine Purple', 'Burgundy Purple', 'Eggplant'];
  }
  
  // Magenta/Pink range (300-360°)
  else if (h >= 300 && h < 315) {
    if (s > 70) baseNames = ['Magenta', 'Fuchsia', 'Electric Pink', 'Hot Pink'];
    else if (l > 60) baseNames = ['Orchid', 'Pink', 'Rose', 'Carnation'];
    else baseNames = ['Mauve', 'Plum', 'Wine', 'Burgundy'];
  } else if (h >= 315 && h < 330) {
    if (s > 70) baseNames = ['Magenta', 'Hot Pink', 'Electric Pink', 'Neon Pink'];
    else if (l > 60) baseNames = ['Orchid', 'Pink', 'Rose', 'Blush'];
    else baseNames = ['Mauve', 'Dusty Rose', 'Old Rose', 'Antique Rose'];
  } else if (h >= 330 && h < 345) {
    if (s > 70) baseNames = ['Hot Pink', 'Magenta', 'Fuchsia', 'Electric Pink'];
    else if (l > 60) baseNames = ['Pink', 'Rose', 'Blush', 'Baby Pink'];
    else baseNames = ['Berry', 'Raspberry', 'Cranberry', 'Rose Wine'];
  } else {
    if (s > 70) baseNames = ['Fuchsia', 'Hot Pink', 'Electric Pink', 'Neon Pink'];
    else if (l > 60) baseNames = ['Pink', 'Rose', 'Blush', 'Cotton Candy'];
    else baseNames = ['Berry', 'Raspberry', 'Wine', 'Dark Rose'];
  }
  
  // Select a random name from the available options for variety
  const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
  
  // Add modifiers based on saturation and lightness
  let modifier = '';
  if (s > 85 && l > 75) {
    const brightModifiers = ['Bright', 'Vibrant', 'Electric', 'Neon'];
    modifier = brightModifiers[Math.floor(Math.random() * brightModifiers.length)] + ' ';
  } else if (s > 80 && l < 35) {
    const deepModifiers = ['Deep', 'Rich', 'Dark', 'Intense'];
    modifier = deepModifiers[Math.floor(Math.random() * deepModifiers.length)] + ' ';
  } else if (s < 35 && l > 65) {
    const softModifiers = ['Soft', 'Pale', 'Light', 'Gentle'];
    modifier = softModifiers[Math.floor(Math.random() * softModifiers.length)] + ' ';
  } else if (s < 35 && l < 45) {
    const mutedModifiers = ['Muted', 'Dusty', 'Faded', 'Vintage'];
    modifier = mutedModifiers[Math.floor(Math.random() * mutedModifiers.length)] + ' ';
  } else if (l > 78) {
    const lightModifiers = ['Light', 'Pale', 'Pastel', 'Soft'];
    modifier = lightModifiers[Math.floor(Math.random() * lightModifiers.length)] + ' ';
  } else if (l < 30) {
    const darkModifiers = ['Dark', 'Deep', 'Shadowy', 'Midnight'];
    modifier = darkModifiers[Math.floor(Math.random() * darkModifiers.length)] + ' ';
  }
  
  return modifier + baseName;
}

/**
 * Legacy function that maps enhanced color names back to basic color names
 * for systems that need the original color categories
 */
export function getBasicColorCategory(enhancedName: string): string {
  const name = enhancedName.toLowerCase();
  
  // Red family
  if (name.includes('wine') || name.includes('crimson') || name.includes('scarlet') || name.includes('rose') || 
      name.includes('burgundy') || name.includes('cherry') || name.includes('ruby') || name.includes('cardinal') || 
      name.includes('vermillion') || name.includes('blush') || name.includes('salmon') || name.includes('maroon') || 
      name.includes('claret') || name.includes('fire engine') || name.includes('flame')) {
    return 'red';
  }
  
  // Orange family
  if (name.includes('tangerine') || name.includes('peach') || name.includes('coral') || name.includes('rust') || 
      name.includes('orange') || name.includes('mandarin') || name.includes('pumpkin') || name.includes('papaya') || 
      name.includes('melon') || name.includes('cantaloupe') || name.includes('copper') || name.includes('auburn') || 
      name.includes('sienna') || name.includes('apricot') || name.includes('sunset') || name.includes('brick') || 
      name.includes('terra cotta')) {
    return 'orange';
  }
  
  // Yellow family
  if (name.includes('amber') || name.includes('honey') || name.includes('butter') || name.includes('golden') || 
      name.includes('bronze') || name.includes('marigold') || name.includes('saffron') || name.includes('turmeric') || 
      name.includes('wheat') || name.includes('sandstone') || name.includes('caramel') || name.includes('cognac') || 
      name.includes('toffee') || name.includes('sunflower') || name.includes('lemon') || name.includes('canary') || 
      name.includes('ivory') || name.includes('champagne') || name.includes('mustard') || name.includes('khaki') || 
      name.includes('brass')) {
    return 'yellow';
  }
  
  // Green family
  if (name.includes('lime') || name.includes('sage') || name.includes('forest') || name.includes('emerald') || 
      name.includes('mint') || name.includes('pine') || name.includes('jade') || name.includes('seafoam') || 
      name.includes('hunter') || name.includes('chartreuse') || name.includes('neon green') || name.includes('pistachio') || 
      name.includes('celery') || name.includes('olive') || name.includes('army green') || name.includes('moss') || 
      name.includes('spring green') || name.includes('electric green') || name.includes('tea green') || 
      name.includes('honeydew') || name.includes('juniper') || name.includes('malachite') || name.includes('kelly green') || 
      name.includes('celadon') || name.includes('lichen') || name.includes('evergreen') || name.includes('fern') || 
      name.includes('ivy') || name.includes('shamrock') || name.includes('clover') || name.includes('mint chip') || 
      name.includes('eucalyptus') || name.includes('bottle green') || name.includes('deep green') || 
      name.includes('sea green') || name.includes('teal green') || name.includes('viridian') || 
      name.includes('aqua mint') || name.includes('sea glass') || name.includes('mint green')) {
    return 'green';
  }
  
  // Cyan family
  if (name.includes('aqua') || name.includes('turquoise') || name.includes('cyan') || name.includes('teal') || 
      name.includes('caribbean') || name.includes('robin egg') || name.includes('petrol') || name.includes('deep sea') || 
      name.includes('pine green') || name.includes('electric blue') || name.includes('neon blue') || 
      name.includes('aqua mist') || name.includes('baby blue') || name.includes('steel blue') || 
      name.includes('peacock') || name.includes('deep teal') || name.includes('abyssal teal')) {
    return 'cyan';
  }
  
  // Blue family
  if (name.includes('azure') || name.includes('sky') || name.includes('periwinkle') || name.includes('steel') || 
      name.includes('sapphire') || name.includes('cornflower') || name.includes('denim') || name.includes('navy') || 
      name.includes('abyss') || name.includes('royal') || name.includes('ice') || name.includes('powder') || 
      name.includes('cerulean') || name.includes('dodger blue') || name.includes('bright blue') || 
      name.includes('slate blue') || name.includes('storm blue') || name.includes('royal blue') || 
      name.includes('cobalt') || name.includes('lavender blue') || name.includes('midnight blue') || 
      name.includes('prussian blue') || name.includes('dark blue') || name.includes('ultramarine') || 
      name.includes('oxford blue') || name.includes('alice blue')) {
    return 'blue';
  }
  
  // Purple family
  if (name.includes('indigo') || name.includes('lilac') || name.includes('eggplant') || name.includes('violet') || 
      name.includes('plum') || name.includes('mulberry') || name.includes('purple') || name.includes('lavender') || 
      name.includes('blue violet') || name.includes('electric purple') || name.includes('royal purple') || 
      name.includes('wisteria') || name.includes('navy purple') || name.includes('dark violet') || 
      name.includes('midnight purple') || name.includes('amethyst') || name.includes('aubergine') || 
      name.includes('deep purple') || name.includes('electric violet') || name.includes('neon purple') || 
      name.includes('thistle') || name.includes('magenta purple') || name.includes('wine purple') || 
      name.includes('burgundy purple')) {
    return 'purple';
  }
  
  // Pink family
  if (name.includes('magenta') || name.includes('orchid') || name.includes('mauve') || name.includes('fuchsia') || 
      name.includes('pink') || name.includes('berry') || name.includes('blush') || name.includes('hot pink') || 
      name.includes('electric pink') || name.includes('carnation') || name.includes('neon pink') || 
      name.includes('dusty rose') || name.includes('old rose') || name.includes('antique rose') || 
      name.includes('baby pink') || name.includes('raspberry') || name.includes('cranberry') || 
      name.includes('rose wine') || name.includes('cotton candy') || name.includes('dark rose')) {
    return 'pink';
  }
  
  // Gray family
  if (name.includes('charcoal') || name.includes('graphite') || name.includes('slate') || name.includes('storm') || 
      name.includes('pewter') || name.includes('silver') || name.includes('dove') || name.includes('pearl') || 
      name.includes('whisper') || name.includes('cloud') || name.includes('obsidian') || name.includes('gunmetal') || 
      name.includes('iron') || name.includes('ash') || name.includes('steel gray') || name.includes('platinum') || 
      name.includes('moonstone') || name.includes('fog') || name.includes('porcelain') || name.includes('snow')) {
    return 'gray';
  }
  
  // Black family
  if (name.includes('midnight') || name.includes('espresso') || name.includes('shadow') || name.includes('void') || 
      name.includes('burnt umber') || name.includes('dark')) {
    return 'black';
  }
  
  // White family
  if (name.includes('cream') || name.includes('vanilla') || name.includes('white') || name.includes('cotton')) {
    return 'white';
  }
  
  // Default fallback
  return 'gray';
}


