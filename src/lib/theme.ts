/**
 * Design Tokens & Theme System
 *
 * Apple Wallet-inspired design language:
 * - Pure black background (#000)
 * - Soft white text with hierarchy
 * - Blue accent (#007AFF - iOS blue)
 * - Smooth spring physics for all animations
 */

// Color tokens - iOS Dark Mode palette
export const colors = {
  // Backgrounds
  background: '#000000',
  surface: '#1C1C1E',          // Elevated surface (cards, modals)
  surfaceElevated: '#2C2C2E',  // Even higher elevation
  surfaceBright: '#3A3A3C',    // Highest elevation

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',    // iOS secondary label
  textTertiary: '#636366',
  textInverse: '#000000',

  // Accent
  accent: '#007AFF',           // iOS blue
  accentLight: '#5AC8FA',
  accentDark: '#0051A8',

  // Semantic
  success: '#34C759',          // iOS green
  warning: '#FF9500',          // iOS orange
  error: '#FF3B30',            // iOS red

  // Separators
  separator: 'rgba(84, 84, 88, 0.6)',
  separatorOpaque: '#38383A',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
} as const;

// Spacing scale (4px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

// Typography
export const typography = {
  // Font sizes (iOS HIG inspired)
  largeTitle: { fontSize: 34, fontWeight: '700', lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: '600', lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 17, fontWeight: '400', lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400', lineHeight: 21 },
  subhead: { fontSize: 15, fontWeight: '400', lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '400', lineHeight: 13 },
} as const;

// Animation configs (react-spring)
export const springConfigs = {
  // Snappy for buttons and quick interactions
  snappy: { tension: 400, friction: 30 },

  // Default for most transitions
  default: { tension: 280, friction: 24 },

  // Gentle for large movements
  gentle: { tension: 180, friction: 22 },

  // Stiff for immediate feedback
  stiff: { tension: 500, friction: 35 },

  // Slow for dramatic reveals
  slow: { tension: 120, friction: 14 },

  // iOS-style spring (feels like UISpring)
  ios: { tension: 300, friction: 28, mass: 0.8 },
} as const;

// Brand colors for known stores
export const brandColors: Record<string, { gradient: string; primary: string }> = {
  ikea: { gradient: 'from-blue-600 to-yellow-500', primary: '#0058A3' },
  coop: { gradient: 'from-red-600 to-red-500', primary: '#E2001A' },
  'leroy merlin': { gradient: 'from-green-600 to-green-500', primary: '#78BE20' },
  leroymerlin: { gradient: 'from-green-600 to-green-500', primary: '#78BE20' },
  target: { gradient: 'from-red-600 to-red-400', primary: '#CC0000' },
  starbucks: { gradient: 'from-green-800 to-green-600', primary: '#00704A' },
  costco: { gradient: 'from-red-700 to-blue-800', primary: '#005DAA' },
  walmart: { gradient: 'from-blue-600 to-blue-400', primary: '#0071DC' },
  amazon: { gradient: 'from-orange-500 to-yellow-400', primary: '#FF9900' },
  apple: { gradient: 'from-gray-800 to-gray-600', primary: '#A3AAAE' },
  nike: { gradient: 'from-orange-600 to-red-500', primary: '#F56600' },
  adidas: { gradient: 'from-gray-900 to-gray-700', primary: '#000000' },
  lidl: { gradient: 'from-blue-600 to-yellow-400', primary: '#0050AA' },
  aldi: { gradient: 'from-blue-800 to-orange-500', primary: '#00467F' },
  carrefour: { gradient: 'from-blue-700 to-red-500', primary: '#004E9F' },
  esselunga: { gradient: 'from-red-600 to-red-500', primary: '#E4002B' },
  conad: { gradient: 'from-red-700 to-orange-500', primary: '#E4002B' },
  decathlon: { gradient: 'from-blue-600 to-blue-400', primary: '#0082C3' },
  mediaworld: { gradient: 'from-red-600 to-red-500', primary: '#E30613' },
  unieuro: { gradient: 'from-orange-600 to-orange-500', primary: '#FF6600' },
  euronics: { gradient: 'from-blue-700 to-blue-500', primary: '#003399' },
  sephora: { gradient: 'from-gray-900 to-gray-800', primary: '#000000' },
  zara: { gradient: 'from-gray-900 to-gray-700', primary: '#000000' },
  hm: { gradient: 'from-red-600 to-red-500', primary: '#E4002B' },
  'h&m': { gradient: 'from-red-600 to-red-500', primary: '#E4002B' },
};

// Get brand colors with fallback
export function getBrandStyle(storeName: string): { gradient: string; primary: string } {
  const normalized = storeName.toLowerCase().trim();

  // Check exact match
  if (brandColors[normalized]) {
    return brandColors[normalized];
  }

  // Check partial match
  for (const [brand, style] of Object.entries(brandColors)) {
    if (normalized.includes(brand) || brand.includes(normalized)) {
      return style;
    }
  }

  // Default fallback
  return { gradient: 'from-slate-700 to-slate-800', primary: '#64748B' };
}

// Safe area helpers
export const safeArea = {
  top: 'env(safe-area-inset-top, 20px)',
  bottom: 'env(safe-area-inset-bottom, 20px)',
  left: 'env(safe-area-inset-left, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
};
