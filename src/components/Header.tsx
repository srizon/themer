'use client';

import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onExportAll: () => void;
  onImport: () => void;
  onClearData: () => void;
}

export default function Header({ onExportAll, onImport, onClearData }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleAction = (action: 'export' | 'import' | 'clear') => {
    switch (action) {
      case 'export':
        onExportAll();
        break;
      case 'import':
        onImport();
        break;
      case 'clear':
        onClearData();
        break;
    }
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-text">
          <h1>Color Palette Generator</h1>
        </div>

        <div className="header-actions">
          <div className="dropdown" ref={menuRef}>
            <button
              className="btn btn-icon btn-ghost"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open actions menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {/* Kebab icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {menuOpen && (
              <div className="dropdown-menu" role="menu">
                <button className="dropdown-item" role="menuitem" onClick={() => handleAction('export')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export All</span>
                </button>

                <button className="dropdown-item" role="menuitem" onClick={() => handleAction('import')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Import</span>
                </button>

                <div className="dropdown-separator" />

                <button className="dropdown-item danger" role="menuitem" onClick={() => handleAction('clear')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  <span>Clear Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
