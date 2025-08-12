'use client';

import { useEffect, useRef, useState } from 'react';
import { exportPageAsSVG, exportPageAsImage } from '@/lib/svgExport';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onExportAll: () => void;
  onImport: () => void;
  onImportFromURL: () => void;
  onClearData: () => void;
}

export default function Header({ title, onTitleChange, onExportAll, onImport, onImportFromURL, onClearData }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isExportingSVG, setIsExportingSVG] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Sync local state when title prop changes
  useEffect(() => {
    // setTempTitle(title); // This line is no longer needed as we are using contentEditable
  }, [title]);

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

  const handleAction = (action: 'export' | 'import' | 'importFromURL' | 'clear') => {
    switch (action) {
      case 'export':
        onExportAll();
        break;
      case 'import':
        onImport();
        break;
      case 'importFromURL':
        onImportFromURL();
        break;
      case 'clear':
        onClearData();
        break;
    }
    setMenuOpen(false);
  };

  const handleExportSVG = async () => {
    setIsExportingSVG(true);
    try {
      await exportPageAsSVG();
      // Show success feedback
      showNotification('Copied to clipboard! You can now paste it in Figma.', 'success');
    } catch (error) {
      console.error('Failed to export SVG:', error);
      // Show error feedback
      showNotification('Failed to copy to clipboard. Please try again.', 'error');
    } finally {
      setIsExportingSVG(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    // Get the current text content from the h1 element
    const titleElement = document.querySelector('.page-title') as HTMLElement;
    if (titleElement) {
      const newTitle = titleElement.textContent?.trim() || '';
      // If title is empty, set it to "Untitled"
      if (!newTitle) {
        titleElement.textContent = 'Untitled';
        onTitleChange('Untitled');
      } else {
        onTitleChange(newTitle);
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur(); // This will trigger handleTitleBlur
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // Reset to original title or "Untitled" if empty
      const titleElement = document.querySelector('.page-title') as HTMLElement;
      if (titleElement) {
        const resetTitle = title || 'Untitled';
        titleElement.textContent = resetTitle;
      }
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-text">
          <h1
            className={`page-title ${isEditingTitle ? 'editing' : ''}`}
            onClick={handleTitleClick}
            contentEditable={isEditingTitle}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            suppressContentEditableWarning={true}
          >
            {title}
          </h1>
        </div>

        <button
          className="btn btn-secondary btn-sm btn-copy-figma"
          onClick={handleExportSVG}
          disabled={isExportingSVG}
          title="Copy page as SVG to clipboard"
        >
          {isExportingSVG ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/>
              <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/>
              <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/>
              <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/>
              <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>
            </svg>
          )}
          <span>Copy to Figma</span>
        </button>

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
                  <span>Download Backup</span>
                </button>

                <button className="dropdown-item" role="menuitem" onClick={() => handleAction('import')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Restore Backup</span>
                </button>

                <button className="dropdown-item" role="menuitem" onClick={() => handleAction('importFromURL')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>Import from URL</span>
                </button>

                <div className="dropdown-separator" />

                <button className="dropdown-item danger" role="menuitem" onClick={() => handleAction('clear')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  <span>Delete All</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
