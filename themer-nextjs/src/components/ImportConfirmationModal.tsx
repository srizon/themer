'use client';

import { useState } from 'react';

interface ImportConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'merge' | 'replace') => void;
}

export default function ImportConfirmationModal({ isOpen, onClose, onAction }: ImportConfirmationModalProps) {
  const [selectedAction, setSelectedAction] = useState<'merge' | 'replace'>('merge');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Import Palettes</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            You have existing palettes. How would you like to handle the import?
          </p>
          
          <div className="space-y-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="import-action"
                value="merge"
                checked={selectedAction === 'merge'}
                onChange={(e) => setSelectedAction(e.target.value as 'merge' | 'replace')}
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-gray-900">Merge</h4>
                <p className="text-sm text-gray-600">
                  Add imported palettes to your existing collection. Duplicates will be skipped.
                </p>
              </div>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="import-action"
                value="replace"
                checked={selectedAction === 'replace'}
                onChange={(e) => setSelectedAction(e.target.value as 'merge' | 'replace')}
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-gray-900">Replace</h4>
                <p className="text-sm text-gray-600">
                  Remove all existing palettes and replace them with the imported ones.
                </p>
              </div>
            </label>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onAction(selectedAction)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              {selectedAction === 'merge' ? 'Merge' : 'Replace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
