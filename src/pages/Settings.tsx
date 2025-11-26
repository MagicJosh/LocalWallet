/**
 * Settings.tsx - App Settings Screen
 *
 * Simple settings page with stats and data management.
 *
 * FEATURES:
 * - Stats dashboard showing card count and offline status
 * - "Delete All Data" button with confirmation
 * - Privacy-focused footer
 *
 * TO MODIFY:
 * - Add new settings options: Add buttons in the "Data Management" section
 * - Change stats: Edit the grid in "Stats Dashboard" section
 * - Add export/import: See storage.ts for exportCards() and importCards()
 *
 * ROUTE: /settings
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShieldCheck, Heart } from 'lucide-react';
import { getAllCards } from '../services/storage';

export function Settings() {
  const navigate = useNavigate();
  const cardCount = getAllCards().length;

  const handleWipe = () => {
    if (confirm('Are you sure you want to delete ALL your cards? This cannot be undone.')) {
      localStorage.removeItem('LOCAL_WALLET_CARDS');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-safe-top pb-safe-bottom flex flex-col">
      {/* Header with Blur */}
      <header className="px-6 py-4 flex items-center gap-4 sticky top-0 z-20 bg-black/80 backdrop-blur-xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-500 active-shrink"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      {/* Content Container with Spacing fixed by px-6 */}
      <div className="px-6 pb-12 space-y-8 mt-4">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1">
            <span className="text-3xl font-black text-blue-500">{cardCount}</span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cards</span>
          </div>
          <div className="bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-1" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Offline</span>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-4">Data</h2>
          <div className="bg-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-800">
            <button
              onClick={handleWipe}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800 active-shrink transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </div>
                <span className="font-medium text-[17px] text-red-500">Delete All Data</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 flex flex-col items-center justify-center space-y-4 opacity-50">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          <p className="text-xs text-center max-w-[200px]">
            Built for privacy. No ads. Just cards.
          </p>
        </div>
      </div>
    </div>
  );
}
