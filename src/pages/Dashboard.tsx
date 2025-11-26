/**
 * Dashboard.tsx - Main Home Screen
 *
 * This is the main landing page showing all stored cards.
 *
 * FEATURES:
 * - Displays all cards in a scrollable list
 * - Search bar to filter cards by store name
 * - Floating Action Button (FAB) to add new cards
 * - Settings button in header
 *
 * TO MODIFY:
 * - Card layout: Edit the CardPreview component below
 * - FAB position/style: Find "Floating Action Button" comment
 * - Search behavior: Edit the 'filtered' variable
 * - Header style: Find "Header with Blur" comment
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Search, CreditCard, Plus } from 'lucide-react';
import type { Card } from '../types/card';
import { getAllCards } from '../services/storage';

/**
 * CardPreview Component
 *
 * Renders a single card with gradient background and store logo.
 * Uses Clearbit API for logos: https://logo.clearbit.com/{storename}.com
 *
 * @param storeName - Name of the store (e.g., "IKEA")
 * @param cardNumber - The membership/loyalty card number
 * @param brandColor - Tailwind gradient classes (e.g., "from-blue-600 to-yellow-500")
 */
interface CardPreviewProps {
  storeName: string;
  cardNumber: string;
  brandColor: string;
}

function CardPreview({ storeName, cardNumber, brandColor }: CardPreviewProps) {
  const cleanName = storeName.toLowerCase().replace(/\s/g, '');

  return (
    <div className={`w-full aspect-[1.586] rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${brandColor || 'from-slate-700 to-slate-800'}`}>
      <div className="absolute inset-0 p-12 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start gap-6">
          <span className="font-black text-2xl tracking-tighter text-white drop-shadow-md truncate flex-1">
            {storeName || 'STORE NAME'}
          </span>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
            {storeName && cleanName.length > 0 ? (
              <img
                src={`https://logo.clearbit.com/${cleanName}.com`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
                className="w-full h-full object-contain p-1"
                alt={`${storeName} logo`}
              />
            ) : null}
            {/* Text Fallback */}
            <span
              className={`${!storeName ? 'flex' : 'hidden'} w-full h-full items-center justify-center bg-slate-200 text-black font-bold text-xs`}
            >
              {storeName ? storeName.slice(0, 2).toUpperCase() : 'ST'}
            </span>
          </div>
        </div>
        <div className="font-mono text-lg tracking-widest text-white/90 drop-shadow-sm truncate">
          {cardNumber || '•••• •••• •••• ••••'}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

export function Dashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = () => {
    setLoading(true);
    const data = getAllCards();
    setCards(data);
    setLoading(false);
  };

  const filtered = cards.filter(c =>
    c.storeName.toLowerCase().includes(term.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-safe-top pb-safe-bottom flex flex-col">
      {/* Header with Blur */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-7 h-7 text-blue-500" /> Wallet
        </h1>
        <Link
          to="/settings"
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center active-shrink"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
        </Link>
      </header>

      {/* Main Content Area (Scrollable) */}
      <div className="pb-24 space-y-10">
        {/* Search */}
        <div className="px-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search passes..."
              value={term}
              onChange={e => setTerm(e.target.value)}
              className="w-full h-14 bg-slate-900 rounded-2xl pl-14 pr-6 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="px-10">
          {cards.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-500 opacity-50">
              <CreditCard className="w-16 h-16 mb-4" />
              <p>No cards yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(card => (
                <Link
                  key={card.id}
                  to={`/card/${card.id}`}
                  className="block cursor-pointer active-shrink"
                >
                  <CardPreview
                    storeName={card.storeName}
                    cardNumber={card.cardNumber}
                    brandColor={card.brandColor}
                  />
                </Link>
              ))}
              {filtered.length === 0 && term && (
                <div className="text-center text-slate-500 mt-12 text-base">
                  No cards match "{term}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - Perfect Center Alignment */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none pb-safe-bottom z-30 mb-8">
        <Link
          to="/add"
          // Centered Plus sign in a perfect circle
          className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center active-shrink pointer-events-auto"
        >
          <Plus className="w-8 h-8 text-white" />
        </Link>
      </div>
    </div>
  );
}
