interface BrandAssets {
  logoUrl: string | null;
  brandColor: string;
}

// Known brand colors for popular stores
const BRAND_COLORS: Record<string, string> = {
  'ikea': '#0058A3',
  'lidl': '#0050AA',
  'aldi': '#00005F',
  'albert heijn': '#00A0E2',
  'ah': '#00A0E2',
  'jumbo': '#FFD100',
  'plus': '#E30613',
  'spar': '#009639',
  'walmart': '#0071DC',
  'target': '#CC0000',
  'costco': '#005DAA',
  'starbucks': '#00704A',
  'mcdonalds': '#FFC72C',
  'amazon': '#FF9900',
  'home depot': '#F96302',
  'leroy merlin': '#78BE20',
  'hornbach': '#FF6600',
  'gamma': '#009639',
  'praxis': '#00A651',
  'hm': '#E50010',
  'h&m': '#E50010',
  'zara': '#000000',
  'primark': '#0063B2',
  'mediamarkt': '#DF0000',
  'coolblue': '#0090E3',
  'best buy': '#0046BE',
  'action': '#00A651',
  'hema': '#CC0000',
  'kruidvat': '#E30613',
  'etos': '#7AB800',
  'decathlon': '#007DBC',
  'nike': '#000000',
  'adidas': '#000000',
};

const DEFAULT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#A855F7',
];

function getKnownColor(name: string): string | null {
  const lower = name.toLowerCase();
  if (BRAND_COLORS[lower]) return BRAND_COLORS[lower];

  for (const [brand, color] of Object.entries(BRAND_COLORS)) {
    if (lower.includes(brand) || brand.includes(lower)) {
      return color;
    }
  }
  return null;
}

function generateColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

export function getInitials(storeName: string): string {
  const words = storeName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

async function tryFetchLogo(name: string): Promise<string | null> {
  const normalized = name.toLowerCase().replace(/[\s'-]+/g, '');
  const domains = [`${normalized}.com`, `${normalized}.nl`, `${normalized}.de`, `${normalized}.co.uk`];

  for (const domain of domains) {
    const url = `https://logo.clearbit.com/${domain}`;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) return url;
    } catch {
      continue;
    }
  }

  // Fallback to Google favicon
  return `https://www.google.com/s2/favicons?domain=${normalized}.com&sz=128`;
}

export async function fetchBrandAssets(storeName: string): Promise<BrandAssets> {
  const knownColor = getKnownColor(storeName);
  const brandColor = knownColor || generateColorFromName(storeName);

  try {
    const logoUrl = await tryFetchLogo(storeName);
    return { logoUrl, brandColor };
  } catch {
    return { logoUrl: null, brandColor };
  }
}

export function getBrandColor(storeName: string): string {
  return getKnownColor(storeName) || generateColorFromName(storeName);
}
