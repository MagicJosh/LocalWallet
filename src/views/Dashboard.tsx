/**
 * Dashboard - Apple Wallet-style home screen
 *
 * Features:
 * - Card stack layout with staggered positions
 * - Search with instant filtering
 * - Swipe-to-delete on cards
 * - Floating action button
 * - Settings access
 */

import { useState, useEffect, useCallback } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { useViewStack } from '../lib/ViewStack';
import { WalletCard } from '../components/WalletCard';
import { getAllCards, deleteCard } from '../services/storage';
import type { Card } from '../types/card';

export function Dashboard() {
  const { push } = useViewStack();
  const [cards, setCards] = useState<Card[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load cards on mount
  const loadCards = useCallback(() => {
    setIsLoading(true);
    const data = getAllCards();
    setCards(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCards();

    // Listen for storage changes (for multi-tab sync)
    const handleStorage = () => loadCards();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadCards]);

  // Filter cards by search term
  const filteredCards = cards.filter(card =>
    card.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle card deletion
  const handleDelete = (id: string) => {
    deleteCard(id);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  // FAB animation
  const [fabSpring, fabApi] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: config.wobbly,
  }));

  const handleFabPress = () => {
    fabApi.start({
      scale: 0.9,
      rotate: 90,
      onRest: () => {
        fabApi.start({ scale: 1, rotate: 0 });
        push('add');
      },
    });
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Wallet</h1>
          </div>

          <button
            onClick={() => push('settings')}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="app-container pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/10 rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        className="flex-1 pb-32 overflow-y-auto app-container"
        style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 20px))' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-1">No cards yet</h3>
            <p className="text-sm text-gray-600 max-w-[200px]">
              Tap the + button to add your first loyalty card
            </p>
          </div>
        ) : filteredCards.length === 0 ? (
          // No search results
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-500">No cards match "{searchTerm}"</p>
          </div>
        ) : (
          // Card list
          <div className="space-y-4 pt-2">
            {filteredCards.map((card, index) => (
              <WalletCard
                key={card.id}
                card={card}
                index={index}
                onClick={() => push('detail', { cardId: card.id })}
                onSwipeDelete={() => handleDelete(card.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none z-40"
        style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 20px))' }}
      >
        <animated.button
          style={{
            scale: fabSpring.scale,
            rotate: fabSpring.rotate.to(r => `${r}deg`),
          }}
          onClick={handleFabPress}
          className="w-14 h-14 bg-blue-500 rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center pointer-events-auto active:shadow-blue-500/60"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </animated.button>
      </div>
    </div>
  );
}
