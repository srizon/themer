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
    <div className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-backdrop" onClick={onClose} />
      
      <div className="modal-content">
        <div className="modal-header">
          <h3>Import Palettes</h3>
          <button
            onClick={onClose}
            className="btn btn-icon btn-ghost"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <p>
            You have existing palettes. How would you like to handle the import?
          </p>
          
          <div className="import-options">
            <label className="import-option">
              <input
                type="radio"
                name="import-action"
                value="merge"
                checked={selectedAction === 'merge'}
                onChange={(e) => setSelectedAction(e.target.value as 'merge' | 'replace')}
                className="input input-radio"
              />
              <div className="option-content">
                <h4>Merge</h4>
                <p>
                  Add imported palettes to your existing collection. Duplicates will be skipped.
                </p>
              </div>
            </label>
            
            <label className="import-option">
              <input
                type="radio"
                name="import-action"
                value="replace"
                checked={selectedAction === 'replace'}
                onChange={(e) => setSelectedAction(e.target.value as 'merge' | 'replace')}
                className="input input-radio"
              />
              <div className="option-content">
                <h4>Replace</h4>
                <p>
                  Remove all existing palettes and replace them with the imported ones.
                </p>
              </div>
            </label>
          </div>
          
          <div className="modal-actions">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => onAction(selectedAction)}
              className="btn btn-primary"
            >
              {selectedAction === 'merge' ? 'Merge' : 'Replace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
