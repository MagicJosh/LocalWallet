/**
 * CardDetail.tsx - Card View Screen
 *
 * Full-screen view of a single card with scannable barcode.
 *
 * FEATURES:
 * - Hero card with gradient background and Clearbit logo
 * - White "pass" section with barcode
 * - Delete confirmation flow (tap "Remove Pass" -> Confirm/Cancel)
 * - Automatically marks card as "used" when viewed
 *
 * TO MODIFY:
 * - Barcode size: Find <Barcode> component, change width/height props
 * - Hero card style: Find "Hero Card" comment
 * - Delete button style: Find "Delete Zone" comment
 *
 * ROUTE: /card/:id (id comes from URL params)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share } from 'lucide-react';
import Barcode from 'react-barcode';
import type { Card } from '../types/card';
import { getCardById, deleteCard, markAsUsed } from '../services/storage';

export function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [card, setCard] = useState<Card | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      const data = getCardById(id);
      if (data) {
        setCard(data);
        markAsUsed(id);
      }
    }
  }, [id]);

  const handleDelete = () => {
    if (!card) return;
    deleteCard(card.id);
    navigate('/');
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <p className="text-slate-500 text-lg">Card not found</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-500 mt-4 bg-transparent border-none cursor-pointer text-[17px]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const cleanName = card.storeName.toLowerCase().replace(/\s/g, '');

  return (
    <div className="fixed inset-0 z-40 bg-black text-white flex flex-col pt-safe-top pb-safe-bottom animate-slide-up">
      {/* Header with Blur */}
      <header className="px-6 py-4 flex items-center justify-between bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center active-shrink"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex gap-3">
          <button className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center active-shrink">
            <Share className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-12">
        {/* Hero Card */}
        <div className={`w-full aspect-[1.586] rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden bg-gradient-to-br ${card.brandColor || 'from-slate-800 to-black'}`}>
          <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <img
                src={`https://logo.clearbit.com/${cleanName}.com`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className="w-16 h-16 rounded-full bg-white p-1 object-contain shadow-sm"
                alt="Store logo"
              />
              <span className="font-bold text-3xl tracking-tight text-white drop-shadow-md">
                {card.storeName}
              </span>
            </div>
            <p className="font-mono text-xl tracking-widest text-white/90 drop-shadow-md">
              {card.cardNumber}
            </p>
          </div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Barcode Pass Section */}
        <div className="mt-8 bg-white text-black rounded-3xl p-8 shadow-lg flex flex-col items-center space-y-6">
          <div className="w-full flex justify-between items-center border-b border-gray-100 pb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Member ID</span>
            <span className="font-mono font-bold text-lg">{card.cardNumber}</span>
          </div>
          <div className="w-full flex justify-center py-4 overflow-hidden">
            <Barcode
              value={card.cardNumber}
              format={card.barcodeFormat === 'QR' ? 'CODE128' : card.barcodeFormat}
              width={2}
              height={80}
              displayValue={false}
              background="transparent"
            />
          </div>
          <p className="text-xs text-gray-400 text-center max-w-[200px]">
            Scan barcode at register
          </p>
        </div>

        {/* Delete Zone */}
        <div className="mt-12">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 text-red-500 font-medium active-shrink rounded-xl hover:bg-slate-900 transition-colors"
            >
              Remove Pass
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold active-shrink"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold active-shrink shadow-lg shadow-red-900/30"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
