/**
 * AddCard - Add new card screen
 *
 * Features:
 * - Live card preview that updates as you type
 * - Camera barcode scanner
 * - Auto-detect barcode format
 * - Spring animation on save
 */

import { useState, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { useViewStack } from '../lib/ViewStack';
import { WalletCardPreview } from '../components/WalletCard';
import { createCard } from '../services/storage';
import { detectBarcodeFormat, getAllFormats, getFormatDisplayName } from '../services/barcodeService';
import type { BarcodeFormat } from '../types/card';

export function AddCard() {
  const { pop, push } = useViewStack();

  const [storeName, setStoreName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect barcode format when card number changes
  useEffect(() => {
    if (cardNumber) {
      const detected = detectBarcodeFormat(cardNumber);
      setBarcodeFormat(detected);
    }
  }, [cardNumber]);

  // Preview spring animation
  const previewSpring = useSpring({
    scale: storeName || cardNumber ? 1 : 0.95,
    opacity: 1,
    config: config.gentle,
  });

  // Submit animation
  const [submitSpring, submitApi] = useSpring(() => ({
    scale: 1,
    y: 0,
    config: config.wobbly,
  }));

  const isValid = storeName.trim() && cardNumber.trim();

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    // Animate button
    submitApi.start({
      scale: 0.95,
      onRest: async () => {
        try {
          await createCard({
            storeName: storeName.trim(),
            cardNumber: cardNumber.trim(),
            barcodeFormat,
          });

          // Success animation then navigate
          submitApi.start({
            y: -20,
            scale: 0.9,
            onRest: () => pop(),
          });
        } catch (error) {
          console.error('Failed to create card:', error);
          setIsSubmitting(false);
          submitApi.start({ scale: 1, y: 0 });
        }
      },
    });
  };

  const formats = getAllFormats();

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
            onClick={() => pop()}
            className="flex items-center gap-2 text-blue-500 active:opacity-70"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[17px]">Back</span>
          </button>

          <h1 className="text-[17px] font-semibold absolute left-1/2 -translate-x-1/2">
            Add Card
          </h1>

          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <main
        className="flex-1 pb-8 overflow-y-auto app-container"
        style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 20px))' }}
      >
        {/* Live Preview */}
        <animated.div
          style={{
            scale: previewSpring.scale,
            opacity: previewSpring.opacity,
          }}
          className="mt-4 mb-8"
        >
          <WalletCardPreview storeName={storeName} cardNumber={cardNumber} />
          <p className="text-center text-gray-500 text-xs mt-3 font-medium uppercase tracking-wider">
            Preview
          </p>
        </animated.div>

        {/* Form */}
        <div className="space-y-7">
          {/* Store Name */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. IKEA, Coop, Leroy Merlin"
              className="w-full h-14 bg-white/10 rounded-xl px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              autoFocus
            />
          </div>

          {/* Card Number with Scanner Button */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Enter or scan barcode"
                className="w-full h-14 bg-white/10 rounded-xl pl-4 pr-14 font-mono text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button
                onClick={() => push('scanner', { onScan: (code: string) => setCardNumber(code) })}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Barcode Format Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              Barcode Format
            </label>
            <div className="relative">
              <button
                onClick={() => setShowFormatPicker(!showFormatPicker)}
                className="w-full h-14 bg-white/10 rounded-xl px-4 flex items-center justify-between text-gray-400 transition-all hover:bg-white/15"
              >
                <span>{getFormatDisplayName(barcodeFormat)} (Auto)</span>
                <svg
                  className={`w-5 h-5 transition-transform ${showFormatPicker ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFormatPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden z-20 animate-fade-in">
                  {formats.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => {
                        setBarcodeFormat(format.value);
                        setShowFormatPicker(false);
                      }}
                      className="w-full h-12 px-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors border-b border-gray-800 last:border-0"
                    >
                      <span className={format.value === barcodeFormat ? 'text-blue-500' : 'text-white'}>
                        {format.label}
                      </span>
                      {format.value === barcodeFormat && (
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <animated.button
          style={{
            scale: submitSpring.scale,
            y: submitSpring.y,
          }}
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full h-14 mt-12 bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to Wallet
            </>
          )}
        </animated.button>
      </main>
    </div>
  );
}
