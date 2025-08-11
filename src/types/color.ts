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
  saturationCurve?: number; // -100 to 100, controls saturation curve shape
}

export interface ImportData {
  version: string;
  exportedAt: string;
  pageTitle?: string;
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
  onTitleChange?: (title: string) => void;
  onNotification?: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export type ExportFormat = 'css' | 'scss' | 'json' | 'tailwind';
export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';
