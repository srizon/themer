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
    <div style={{ minHeight: '100vh' }}>
      <div className="container">
        <Header
          onExportAll={handleExportAll}
          onImport={handleImport}
          onClearData={handleClearData}
        />

        <div id="color-sets-container">
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

        <div className="add-color-set-section">
          <button
            onClick={handleAddColorSet}
            className="btn btn-secondary btn-lg"
          >
            + Add Another Color
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
