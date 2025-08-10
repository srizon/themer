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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);



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
    
    // Expose debugging methods in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).colorThemer = themer;
      (window as any).debugConstraints = () => {
        const colorSets = themer.getColorSets();
        if (colorSets.length > 0) {
          console.log('🔍 Testing constraint enforcement for all color sets:');
          colorSets.forEach((colorSet, index) => {
            console.log(`\n--- Color Set ${index + 1} ---`);
            themer.debugConstraintEnforcement(colorSet);
          });
        } else {
          console.log('No color sets available to debug.');
        }
      };
      console.log('🛠️ Development debugging available:');
      console.log('- Use window.debugConstraints() to check constraint enforcement');
      console.log('- Use window.colorThemer to access the ColorThemer instance');
    }
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    // Only prevent dragging when the user is dragging the range slider
    const target = e.target as HTMLElement;
    
    // Check if the drag started from a range slider input
    if (target.closest('input[type="range"]')) {
      e.preventDefault();
      return;
    }
    
    // Allow dragging from anywhere else (including the entire color section)
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (colorThemer && !isNaN(dragIndex) && dragIndex !== dropIndex) {
      colorThemer.reorderColorSets(dragIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
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
          {colorSets.map((colorSet, index) => (
            <div
              key={colorSet.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`color-set-wrapper ${
                draggedIndex === index ? 'dragging' : ''
              } ${
                dragOverIndex === index ? 'drag-over' : ''
              }`}
            >
              <ColorSet
                colorSet={colorSet}
                onRemove={handleRemoveColorSet}
                onUpdate={handleUpdateColorSet}
                onExport={() => {
                  setCurrentExportColorSet(colorSet);
                  setExportModalOpen(true);
                }}
              />
            </div>
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
