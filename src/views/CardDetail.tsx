/**
 * CardDetail - Full card view with barcode
 *
 * Features:
 * - Hero card display
 * - Scannable barcode
 * - Brightness boost for scanning
 * - Delete confirmation
 * - Slide-up animation
 */

import { useState, useEffect, useCallback } from 'react';
import { useSpring, animated, config } from 'react-spring';
import Barcode from 'react-barcode';
import { useViewStack } from '../lib/ViewStack';
import { getCardById, deleteCard, markAsUsed, toggleFavorite } from '../services/storage';
import { getBrandStyle } from '../lib/theme';
import type { Card } from '../types/card';

export function CardDetail() {
  const { pop, currentView } = useViewStack();
  const cardId = currentView.params?.cardId as string;

  const [card, setCard] = useState<Card | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isBrightMode, setIsBrightMode] = useState(false);

  // Load card data
  useEffect(() => {
    if (cardId) {
      const data = getCardById(cardId);
      if (data) {
        setCard(data);
        markAsUsed(cardId);
      }
    }
  }, [cardId]);

  // Brightness boost
  const toggleBrightness = useCallback(() => {
    if (!isBrightMode) {
      // Boost brightness using CSS filter on body
      document.body.style.filter = 'brightness(1.5)';
      document.body.style.backgroundColor = '#fff';
      setIsBrightMode(true);
    } else {
      // Restore normal brightness
      document.body.style.filter = '';
      document.body.style.backgroundColor = '';
      setIsBrightMode(false);
    }
  }, [isBrightMode]);

  // Cleanup brightness on unmount
  useEffect(() => {
    return () => {
      document.body.style.filter = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  // Delete animation
  const [deleteSpring, deleteApi] = useSpring(() => ({
    scale: 1,
    opacity: 1,
    config: config.stiff,
  }));

  const handleDelete = () => {
    if (!card) return;

    deleteApi.start({
      scale: 0.9,
      opacity: 0,
      onRest: () => {
        deleteCard(card.id);
        pop();
      },
    });
  };

  const handleToggleFavorite = () => {
    if (!card) return;
    const newStatus = toggleFavorite(card.id);
    setCard(prev => prev ? { ...prev, isFavorite: newStatus } : null);
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Card not found</p>
          <button onClick={pop} className="text-blue-500">Go Back</button>
        </div>
      </div>
    );
  }

  const brandStyle = getBrandStyle(card.storeName);
  const cleanName = card.storeName.toLowerCase().replace(/\s/g, '');
  const logoUrl = card.logoUrl || `https://logo.clearbit.com/${cleanName}.com`;

  return (
    <animated.div
      style={{ scale: deleteSpring.scale, opacity: deleteSpring.opacity }}
      className={`min-h-screen flex flex-col ${isBrightMode ? 'bg-white' : 'bg-black'} transition-colors duration-300`}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl"
        style={{
          paddingTop: 'env(safe-area-inset-top, 20px)',
          backgroundColor: isBrightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <button
            onClick={pop}
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
              isBrightMode ? 'bg-black/10' : 'bg-white/10'
            }`}
          >
            <svg className={`w-5 h-5 ${isBrightMode ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-2">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
                isBrightMode ? 'bg-black/10' : 'bg-white/10'
              }`}
            >
              <svg
                className={`w-5 h-5 ${card.isFavorite ? 'text-yellow-400' : isBrightMode ? 'text-black' : 'text-white'}`}
                fill={card.isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

            {/* Brightness toggle */}
            <button
              onClick={toggleBrightness}
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
                isBrightMode ? 'bg-yellow-400' : 'bg-white/10'
              }`}
            >
              <svg className={`w-5 h-5 ${isBrightMode ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 pb-8 overflow-y-auto">
        {/* Hero Card */}
        <div
          className={`w-full aspect-[1.586] rounded-3xl shadow-2xl relative overflow-hidden bg-gradient-to-br ${brandStyle.gradient}`}
        >
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />

          {/* Ambient glow */}
          <div
            className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-40"
            style={{ backgroundColor: brandStyle.primary }}
          />

          {/* Content */}
          <div className="relative z-10 h-full p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              {/* Logo */}
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src={logoUrl}
                  alt={card.storeName}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <h2 className="font-bold text-2xl text-white tracking-tight drop-shadow-md">
                {card.storeName}
              </h2>
            </div>

            <div className="flex items-end justify-between">
              <span className="font-mono text-lg text-white/90 tracking-widest drop-shadow-md">
                {card.cardNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Barcode Section */}
        <div className={`mt-6 rounded-3xl p-6 shadow-lg ${isBrightMode ? 'bg-white' : 'bg-white'}`}>
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Member ID
            </span>
            <span className="font-mono font-bold text-lg text-black">
              {card.cardNumber}
            </span>
          </div>

          <div className="flex justify-center py-4 overflow-hidden">
            <Barcode
              value={card.cardNumber}
              format={card.barcodeFormat === 'QR' ? 'CODE128' : card.barcodeFormat}
              width={2}
              height={80}
              displayValue={false}
              background="transparent"
            />
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Present this barcode at checkout
          </p>
        </div>

        {/* Delete Zone */}
        <div className="mt-8">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className={`w-full py-4 rounded-xl font-medium transition-colors ${
                isBrightMode
                  ? 'text-red-500 hover:bg-red-50 active:bg-red-100'
                  : 'text-red-500 hover:bg-red-500/10 active:bg-red-500/20'
              }`}
            >
              Remove Card
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className={`flex-1 py-4 rounded-xl font-semibold transition-colors ${
                  isBrightMode ? 'bg-gray-100 text-black' : 'bg-white/10 text-white'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 active:scale-[0.98] transition-all"
              >
                Confirm Delete
              </button>
            </div>
          )}
        </div>
      </main>
    </animated.div>
  );
}
