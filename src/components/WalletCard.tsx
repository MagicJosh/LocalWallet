/**
 * WalletCard - Apple Wallet-style card component
 *
 * Features:
 * - Credit card aspect ratio (1.586:1)
 * - Gradient backgrounds based on brand
 * - Clearbit logo integration with fallback
 * - Subtle glass morphism effect
 * - Touch feedback animation
 */

import { useState } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import type { Card } from '../types/card';
import { getBrandStyle } from '../lib/theme';

interface WalletCardProps {
  card: Card;
  onClick?: () => void;
  onSwipeDelete?: () => void;
  showSwipeHint?: boolean;
  index?: number;
  isStacked?: boolean;
}

export function WalletCard({
  card,
  onClick,
  onSwipeDelete,
  showSwipeHint = false,
  index = 0,
  isStacked = false,
}: WalletCardProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const brandStyle = getBrandStyle(card.storeName);

  // Press animation
  const pressSpring = useSpring({
    scale: isPressed ? 0.97 : 1,
    config: config.stiff,
  });

  // Swipe-to-delete animation
  const [{ x, deleteOpacity }, swipeApi] = useSpring(() => ({
    x: 0,
    deleteOpacity: 0,
    config: { tension: 300, friction: 28 },
  }));

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (!onSwipeDelete) return;

      if (active) {
        // Only allow swiping left
        const clampedX = Math.min(0, mx);
        swipeApi.start({
          x: clampedX,
          deleteOpacity: Math.min(Math.abs(clampedX) / 100, 1),
          immediate: true,
        });
      } else {
        const shouldDelete = mx < -120 || (vx > 0.5 && dx < 0);

        if (shouldDelete) {
          // Animate out then delete
          swipeApi.start({
            x: -window.innerWidth,
            deleteOpacity: 1,
            onRest: onSwipeDelete,
          });
        } else {
          // Snap back
          swipeApi.start({
            x: 0,
            deleteOpacity: 0,
          });
        }
      }
    },
    { axis: 'x', filterTaps: true }
  );

  const cleanName = card.storeName.toLowerCase().replace(/\s/g, '');
  const logoUrl = card.logoUrl || `https://logo.clearbit.com/${cleanName}.com`;
  const initials = card.storeName.slice(0, 2).toUpperCase();

  // Stack offset for stacked layout
  const stackOffset = isStacked ? index * 8 : 0;

  return (
    <div className="relative">
      {/* Delete indicator behind card */}
      {onSwipeDelete && (
        <animated.div
          style={{ opacity: deleteOpacity }}
          className="absolute inset-0 bg-red-500/20 rounded-2xl flex items-center justify-end pr-6"
        >
          <div className="flex items-center gap-2 text-red-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="font-semibold">Delete</span>
          </div>
        </animated.div>
      )}

      <animated.div
        {...(onSwipeDelete ? bind() : {})}
        style={{
          x,
          scale: pressSpring.scale,
          marginTop: stackOffset,
        }}
        onPointerDown={() => onClick && setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        onClick={onClick}
        className={`
          relative w-full aspect-[1.586] rounded-2xl overflow-hidden cursor-pointer
          shadow-xl shadow-black/40
          bg-gradient-to-br ${brandStyle.gradient}
          touch-pan-y select-none
        `}
      >
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />

        {/* Ambient glow blob */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: brandStyle.primary }}
        />

        {/* Content */}
        <div className="relative z-10 h-full p-5 flex flex-col justify-between">
          {/* Top row: Store name + Logo */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-bold text-xl text-white tracking-tight truncate flex-1 drop-shadow-sm">
              {card.storeName}
            </h3>

            {/* Logo */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
              {!logoFailed ? (
                <img
                  src={logoUrl}
                  alt={card.storeName}
                  className="w-full h-full object-contain p-1.5"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <span className="text-xs font-bold text-gray-700">{initials}</span>
              )}
            </div>
          </div>

          {/* Bottom row: Card number */}
          <div className="flex items-end justify-between">
            <span className="font-mono text-base text-white/90 tracking-wider drop-shadow-sm">
              {card.cardNumber}
            </span>

            {/* Favorite indicator */}
            {card.isFavorite && (
              <div className="w-6 h-6 text-yellow-400">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Swipe hint */}
        {showSwipeHint && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        )}
      </animated.div>
    </div>
  );
}

// Preview variant for AddCard form
interface WalletCardPreviewProps {
  storeName: string;
  cardNumber: string;
}

export function WalletCardPreview({ storeName, cardNumber }: WalletCardPreviewProps) {
  const brandStyle = getBrandStyle(storeName || 'placeholder');
  const [logoFailed, setLogoFailed] = useState(false);

  const cleanName = (storeName || '').toLowerCase().replace(/\s/g, '');
  const logoUrl = `https://logo.clearbit.com/${cleanName}.com`;
  const initials = (storeName || 'ST').slice(0, 2).toUpperCase();

  return (
    <div
      className={`
        relative w-full aspect-[1.586] rounded-2xl overflow-hidden
        shadow-xl shadow-black/40
        bg-gradient-to-br ${brandStyle.gradient}
        transition-all duration-500
      `}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />

      {/* Ambient glow */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 transition-colors duration-500"
        style={{ backgroundColor: brandStyle.primary }}
      />

      {/* Content */}
      <div className="relative z-10 h-full p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-bold text-xl text-white tracking-tight truncate flex-1 drop-shadow-sm">
            {storeName || 'Store Name'}
          </h3>

          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
            {storeName && !logoFailed ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="w-full h-full object-contain p-1.5"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="text-xs font-bold text-gray-700">{initials}</span>
            )}
          </div>
        </div>

        <span className="font-mono text-base text-white/90 tracking-wider drop-shadow-sm">
          {cardNumber || ''}
        </span>
      </div>
    </div>
  );
}
