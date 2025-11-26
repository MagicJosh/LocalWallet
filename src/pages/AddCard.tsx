/**
 * AddCard.tsx - Add New Card Screen
 *
 * Form for adding a new loyalty/membership card to the wallet.
 *
 * FEATURES:
 * - Live card preview that updates as you type
 * - Camera scanner for barcodes (opens ScannerModal)
 * - Auto-detect barcode format from card number
 * - Brand-specific gradient colors (IKEA = blue/yellow, Target = red, etc.)
 * - Clearbit logo integration
 *
 * TO MODIFY:
 * - Add new brand gradients: Edit getBrandGradient() function
 * - Change input styles: Search for "input" classes
 * - Scanner button: Find "Camera Button" comment
 * - Submit button: Find "Bottom Action Button" comment
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ChevronDown, Check } from 'lucide-react';
import { createCard } from '../services/storage';
import { detectBarcodeFormat, getAllFormats, getFormatDisplayName } from '../services/barcodeService';
import { ScannerModal } from '../components/ScannerModal';
import type { BarcodeFormat } from '../types/card';

/**
 * CardPreview Component
 *
 * Live preview of the card being created. Updates in real-time as user types.
 * Shows store name, card number, and attempts to load logo from Clearbit.
 *
 * @param storeName - Store name entered by user
 * @param cardNumber - Card number entered by user
 * @param gradientClass - Tailwind gradient classes for background
 */
interface CardPreviewProps {
  storeName: string;
  cardNumber: string;
  gradientClass: string;
}

function CardPreview({ storeName, cardNumber, gradientClass }: CardPreviewProps) {
  const cleanName = storeName.toLowerCase().replace(/\s/g, '');

  return (
    <div className={`w-full card-aspect rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${gradientClass}`}>
      <div className="absolute inset-0 p-16 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start gap-8">
          <span className="font-black text-2xl tracking-tighter text-white drop-shadow-md truncate flex-1">
            {storeName || 'STORE NAME'}
          </span>
          {/* Logo with Clearbit Integration */}
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

      {/* Glossy Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

/**
 * getBrandGradient - Returns Tailwind gradient classes for known brands
 *
 * ADD NEW BRANDS HERE! Just add another if statement:
 *   if (name.includes('yourstore')) return 'from-color1 to-color2';
 *
 * @param storeName - The store name to match
 * @returns Tailwind gradient classes (e.g., "from-blue-600 to-yellow-500")
 */
function getBrandGradient(storeName: string): string {
  const name = storeName.toLowerCase();
  if (name.includes('ikea')) return 'from-blue-600 to-yellow-500';
  if (name.includes('target')) return 'from-red-600 to-red-400';
  if (name.includes('starbucks')) return 'from-green-800 to-green-600';
  if (name.includes('costco')) return 'from-red-700 to-blue-800';
  if (name.includes('walmart')) return 'from-blue-600 to-blue-400';
  if (name.includes('amazon')) return 'from-orange-500 to-yellow-400';
  if (name.includes('apple')) return 'from-gray-800 to-gray-600';
  if (name.includes('nike')) return 'from-orange-600 to-red-500';
  if (name.includes('adidas')) return 'from-gray-900 to-gray-700';
  if (name.includes('albert')) return 'from-blue-700 to-cyan-500';
  if (name.includes('lidl')) return 'from-blue-600 to-yellow-400';
  if (name.includes('aldi')) return 'from-blue-800 to-orange-500';
  return 'from-slate-700 to-slate-800';
}

export function AddCard() {
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandGradient, setBrandGradient] = useState('from-slate-700 to-slate-800');

  // Update gradient when store name changes
  useEffect(() => {
    setBrandGradient(getBrandGradient(storeName));
  }, [storeName]);

  const handleCardNumberChange = (value: string) => {
    setCardNumber(value);
    const detected = detectBarcodeFormat(value);
    setBarcodeFormat(detected);
  };

  const handleScanResult = (code: string) => {
    setCardNumber(code);
    const detected = detectBarcodeFormat(code);
    setBarcodeFormat(detected);
    setShowScanner(false);
  };

  const handleSubmit = async () => {
    if (!storeName.trim() || !cardNumber.trim()) return;

    setLoading(true);
    try {
      await createCard({
        storeName: storeName.trim(),
        cardNumber: cardNumber.trim(),
        barcodeFormat,
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to add card:', error);
      alert('Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const formats = getAllFormats();
  const isValid = storeName.trim() && cardNumber.trim();

  return (
    <div className="min-h-screen bg-black text-white pt-safe-top pb-safe-bottom flex flex-col">
      {/* Header with Blur */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-500 active-shrink"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <h1 className="text-[17px] font-semibold absolute left-1/2 -translate-x-1/2">Add Card</h1>
        <div className="w-16" />
      </header>

      <div className="pb-12 flex-1 flex flex-col items-center">
        <div className="w-full max-w-sm px-[18px]">

        {/* SECTION 1: Live Card Preview */}
        <div className="mt-4 mb-10 transform transition-all duration-300 hover:scale-[1.02]">
          <CardPreview
            storeName={storeName}
            cardNumber={cardNumber}
            gradientClass={brandGradient}
          />
          <p className="text-center text-slate-500 text-xs mt-3 font-medium tracking-wide uppercase">
            Preview
          </p>
        </div>

        {/* SECTION 2: Form Inputs */}
        <div className="space-y-12">

          {/* Store Name Input */}
          <div className="space-y-4 mb-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
              Store Details
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Store Name (e.g. Ikea)"
              className="input-native"
              autoFocus
            />
          </div>

          {/* Card Number Input with Scan Button */}
          <div className="space-y-2 relative mb-3">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="Card Number"
              className="w-full h-14 bg-slate-900 border border-slate-800 rounded-2xl pl-5 pr-14 font-mono text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            />
            {/* Camera Button aligned perfectly to the right */}
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="absolute right-2 top-1 bottom-1 aspect-square flex items-center justify-center text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors active-shrink"
              aria-label="Scan barcode"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>

          {/* Barcode Format Selector */}
          <div className="relative mb-3">
            <button
              onClick={() => setShowFormatPicker(!showFormatPicker)}
              className="w-full h-14 bg-slate-900 border border-slate-800 rounded-2xl px-5 flex items-center justify-between text-slate-400 transition-all hover:border-slate-700"
            >
              <span>{getFormatDisplayName(barcodeFormat)} (Auto)</span>
              <ChevronDown className={`w-5 h-5 opacity-50 transition-transform ${showFormatPicker ? 'rotate-180' : ''}`} />
            </button>

            {showFormatPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden z-30 animate-fade-in">
                {formats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => {
                      setBarcodeFormat(format.value);
                      setShowFormatPicker(false);
                    }}
                    className="w-full h-14 px-5 flex items-center justify-between text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                  >
                    <span className={format.value === barcodeFormat ? 'text-blue-500' : 'text-white'}>
                      {format.label}
                    </span>
                    {format.value === barcodeFormat && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="mt-auto pt-12">
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 active-shrink flex items-center justify-center gap-2 text-[17px]"
          >
            {loading ? 'Adding...' : 'Add to Wallet'}
          </button>
        </div>
        </div>
      </div>

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />
    </div>
  );
}
