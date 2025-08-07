'use client';

interface HeaderProps {
  onExportAll: () => void;
  onImport: () => void;
  onClearData: () => void;
}

export default function Header({ onExportAll, onImport, onClearData }: HeaderProps) {
  return (
    <header className="mb-12">
      <div className="flex justify-between items-start gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2 tracking-tight">
            Color Palette Generator
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
          <button
            onClick={onExportAll}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors"
            title="Export all palettes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export All
          </button>
          
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors"
            title="Import palettes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import
          </button>
          
          <button
            onClick={onClearData}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors"
            title="Clear all saved data"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear Data
          </button>
        </div>
      </div>
    </header>
  );
}
