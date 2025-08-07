'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ColorSet from '@/components/ColorSet';
import ExportModal from '@/components/ExportModal';
import ImportConfirmationModal from '@/components/ImportConfirmationModal';
import { ColorThemer } from '@/lib/ColorThemer';
import { ColorSet as ColorSetType, ImportData } from '@/types/color';

export default function Home() {
  const [colorThemer, setColorThemer] = useState<ColorThemer | null>(null);
  const [colorSets, setColorSets] = useState<ColorSetType[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [currentExportColorSet, setCurrentExportColorSet] = useState<ColorSetType | null>(null);
  const [importData, setImportData] = useState<ImportData | null>(null);

  useEffect(() => {
    const themer = new ColorThemer({
      onColorSetsChange: (sets) => setColorSets(sets),
      onExportModalOpen: (colorSet) => {
        setCurrentExportColorSet(colorSet);
        setExportModalOpen(true);
      },
      onImportModalOpen: (data) => {
        setImportData(data);
        setImportModalOpen(true);
      }
    });
    setColorThemer(themer);
  }, []);

  const handleExportAll = () => {
    if (colorThemer) {
      colorThemer.exportAllPalettes();
    }
  };

  const handleImport = () => {
    if (colorThemer) {
      colorThemer.importPalettes();
    }
  };

  const handleClearData = () => {
    if (colorThemer) {
      colorThemer.clearAllData();
    }
  };

  const handleAddColorSet = () => {
    if (colorThemer) {
      colorThemer.addColorSet();
    }
  };

  const handleRemoveColorSet = (setId: number) => {
    if (colorThemer) {
      colorThemer.removeColorSet(setId);
    }
  };

  const handleUpdateColorSet = (setId: number, updates: Partial<ColorSetType>) => {
    if (colorThemer) {
      colorThemer.updateColorSet(setId, updates);
    }
  };

  const handleExportModalClose = () => {
    setExportModalOpen(false);
    setCurrentExportColorSet(null);
  };

  const handleImportModalClose = () => {
    setImportModalOpen(false);
    setImportData(null);
  };

  const handleImportAction = (action: 'merge' | 'replace') => {
    if (colorThemer && importData) {
      colorThemer.processImport(importData, action === 'merge');
      handleImportModalClose();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-20 py-20">
        <Header
          onExportAll={handleExportAll}
          onImport={handleImport}
          onClearData={handleClearData}
        />

        <div id="color-sets-container" className="space-y-8">
          {colorSets.map((colorSet) => (
            <ColorSet
              key={colorSet.id}
              colorSet={colorSet}
              onRemove={handleRemoveColorSet}
              onUpdate={handleUpdateColorSet}
              onExport={() => {
                setCurrentExportColorSet(colorSet);
                setExportModalOpen(true);
              }}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleAddColorSet}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            + Add Another Color Set
          </button>
        </div>

        <ExportModal
          isOpen={exportModalOpen}
          onClose={handleExportModalClose}
          colorSet={currentExportColorSet}
        />

        <ImportConfirmationModal
          isOpen={importModalOpen}
          onClose={handleImportModalClose}
          onAction={handleImportAction}
        />
      </div>
    </div>
  );
}
