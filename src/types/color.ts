export interface ColorSet {
  id: number;
  baseColor: string;
  colorCount: number;
  colors: string[];
  generatedName?: string;
  customName?: string;
  minContrast?: number;
  maxContrast?: number;
  minLightness?: number;
  maxLightness?: number;
}

export interface ImportData {
  version: string;
  exportedAt: string;
  colorSets: ColorSet[];
  metadata: {
    totalPalettes: number;
    totalColors: number;
  };
}

export interface ColorThemerCallbacks {
  onColorSetsChange: (colorSets: ColorSet[]) => void;
  onExportModalOpen: (colorSet: ColorSet) => void;
  onImportModalOpen: (data: ImportData) => void;
  onNotification?: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export type ExportFormat = 'css' | 'scss' | 'json' | 'tailwind';
export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';
