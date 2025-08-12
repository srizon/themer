'use client';

import { useState } from 'react';

interface ImportURLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (url: string) => void;
}

export default function ImportURLModal({ isOpen, onClose, onImport }: ImportURLModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setIsLoading(true);
    try {
      await onImport(url.trim());
      onClose();
      setUrl('');
    } catch (error) {
      console.error('Import failed:', error);
      // Show the actual error message from ColorThemer for better user experience
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Import failed. Please check the error message above and try again.');
      }
      // Keep the modal open so user can see the error and try again
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setUrl('');
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`} role="dialog" aria-modal="true" aria-labelledby="import-url-modal-title">
      <div className="modal-backdrop" onClick={handleClose} />
      
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="import-url-modal-title">Import from URL</h3>
          <button
            onClick={handleClose}
            className="btn btn-icon btn-ghost"
            disabled={isLoading}
            aria-label="Close import URL modal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="export-section">
            <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-light)', lineHeight: 'var(--line-height-normal)' }}>
              Enter the URL of the JSON file to import your color palettes.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="export-section">
                <label htmlFor="url-input" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '500', color: 'var(--color-primary)', fontSize: 'var(--font-size-base)' }}>
                  URL
                </label>
                <input
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/palettes.json"
                  className="input"
                  style={{ width: '100%' }}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="export-section" style={{ marginTop: 'var(--spacing-md)' }}>
                  <div style={{ 
                    padding: 'var(--spacing-sm)', 
                    backgroundColor: 'var(--color-error-bg)', 
                    color: 'var(--color-error)', 
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    border: '1px solid var(--color-error)'
                  }}>
                    {error}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!url.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Importing...
                    </>
                  ) : (
                    'Import'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
