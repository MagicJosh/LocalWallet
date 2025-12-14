/**
 * Settings - App settings and data management
 *
 * Features:
 * - Card count stats
 * - Export cards to JSON file
 * - Import cards from JSON file
 * - Delete all data
 * - Privacy-focused footer
 */

import { useState, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { useViewStack } from '../lib/ViewStack';
import { getAllCards, exportCards, importCards } from '../services/storage';

export function Settings() {
  const { pop } = useViewStack();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cardCount] = useState(() => getAllCards().length);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);

  // Stats animation
  const statsSpring = useSpring({
    from: { number: 0 },
    number: cardCount,
    delay: 200,
    config: { tension: 200, friction: 20 },
  });

  // Handle export
  const handleExport = () => {
    try {
      const data = exportCards();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wallet-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importCards(text);
      setImportedCount(count);
      setImportStatus('success');

      // Reset after showing success
      setTimeout(() => {
        setImportStatus('idle');
        // Refresh the page to show new cards
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle delete all
  const handleDeleteAll = () => {
    localStorage.removeItem('LOCAL_WALLET_CARDS');
    pop();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl"
        style={{
          paddingTop: 'env(safe-area-inset-top, 20px)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="app-container py-4 flex items-center justify-between">
          <button
            onClick={pop}
            className="flex items-center gap-2 text-blue-500 active:opacity-70"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[17px]">Back</span>
          </button>

          <h1 className="text-xl font-bold">Settings</h1>

          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <main
        className="flex-1 pb-8 overflow-y-auto app-container"
        style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 20px))' }}
      >
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 gap-5 mt-5">
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col items-center justify-center">
            <animated.span className="text-3xl font-bold text-blue-500">
              {statsSpring.number.to(n => Math.floor(n))}
            </animated.span>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">
              Cards
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 flex flex-col items-center justify-center">
            <div className="w-8 h-8 text-green-500 mb-1">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Offline
            </span>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="mt-10">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-4">
            Data Management
          </h2>

          <div className="bg-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
            {/* Export */}
            <button
              onClick={handleExport}
              disabled={cardCount === 0}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <span className="text-[17px] text-white block">Export Cards</span>
                <span className="text-sm text-gray-500">Download as JSON backup</span>
              </div>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <span className="text-[17px] text-white block">Import Cards</span>
                <span className="text-sm text-gray-500">Restore from JSON backup</span>
              </div>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Import Status */}
        {importStatus !== 'idle' && (
          <div
            className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
              importStatus === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            {importStatus === 'success' ? (
              <>
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-500">Imported {importedCount} cards!</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-red-500">Import failed. Invalid file format.</span>
              </>
            )}
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-10">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-4">
            Danger Zone
          </h2>

          <div className="bg-white/5 rounded-2xl overflow-hidden">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 active:bg-red-500/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <span className="text-[17px] text-red-500">Delete All Data</span>
              </button>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-4">
                  Are you sure? This will permanently delete all your cards.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 active:scale-[0.98]"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-14 flex flex-col items-center justify-center opacity-40">
          <div className="w-8 h-8 text-red-500 mb-2">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <p className="text-xs text-center max-w-[200px]">
            Built for privacy. No ads. No tracking. Your data stays on your device.
          </p>
          <p className="text-xs mt-2 text-gray-600">v1.0.0</p>
        </div>
      </main>
    </div>
  );
}
