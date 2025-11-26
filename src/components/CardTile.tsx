import { Link } from 'react-router-dom';
import type { Card } from '../types/card';
import { LogoAvatar } from './LogoAvatar';
import { IconStar } from './Icons';

interface CardTileProps {
  card: Card;
}

export function CardTile({ card }: CardTileProps) {
  const displayNumber = card.cardNumber.length > 4
    ? `•••• ${card.cardNumber.slice(-4)}`
    : card.cardNumber;

  return (
    <Link
      to={`/card/${card.id}`}
      className="block press-scale"
    >
      <div
        className="rounded-2xl p-4 h-[130px] flex flex-col justify-between relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${card.brandColor} 0%, ${adjustBrightness(card.brandColor, -20)} 100%)`,
          boxShadow: `0 4px 20px ${card.brandColor}30, 0 2px 8px rgba(0,0,0,0.2)`,
        }}
      >
        {/* Subtle highlight overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
          }}
        />

        <div className="flex justify-between items-start relative z-10">
          <LogoAvatar
            logoUrl={card.logoUrl}
            storeName={card.storeName}
            brandColor="rgba(255,255,255,0.2)"
            size="small"
          />
          {card.isFavorite && (
            <IconStar size={16} color="#FFD60A" filled />
          )}
        </div>

        <div className="relative z-10">
          <h3 className="text-white font-semibold text-[15px] truncate mb-0.5">
            {card.storeName}
          </h3>
          <p className="text-white/70 text-xs font-mono tracking-wide">
            {displayNumber}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Helper to darken/lighten colors
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
