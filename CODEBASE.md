# LocalWallet PWA - Codebase Documentation

A Progressive Web App for storing loyalty/membership cards offline on your phone.

---

## Project Structure

```
LocalWalletPWA/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ScannerModal.tsx  # Camera barcode scanner modal
│   │   ├── BarcodeView.tsx   # Renders barcodes using react-barcode
│   │   ├── CardTile.tsx      # Card preview tile (legacy)
│   │   ├── EmptyState.tsx    # "No cards" placeholder
│   │   ├── Icons.tsx         # Custom SVG icons (legacy)
│   │   ├── LogoAvatar.tsx    # Store logo/initials avatar
│   │   └── SearchBar.tsx     # Search input (legacy)
│   │
│   ├── pages/               # Main app screens
│   │   ├── Dashboard.tsx     # Home screen - card list + FAB
│   │   ├── AddCard.tsx       # Add new card form
│   │   ├── CardDetail.tsx    # View card + barcode
│   │   └── Settings.tsx      # App settings
│   │
│   ├── services/            # Business logic & data
│   │   ├── storage.ts        # LocalStorage CRUD operations
│   │   ├── brandService.ts   # Logo fetching & brand colors
│   │   └── barcodeService.ts # Barcode format detection
│   │
│   ├── types/               # TypeScript definitions
│   │   └── card.ts           # Card interface & BarcodeFormat type
│   │
│   ├── App.tsx              # Router setup
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles & Tailwind
│
├── public/                  # Static assets
│   └── icons/               # PWA icons (192x192, 512x512)
│
├── index.html               # HTML template with PWA meta tags
├── vite.config.ts           # Vite + PWA plugin config
├── tailwind.config.js       # Tailwind CSS config
└── package.json             # Dependencies
```

---

## Key Files Explained

### Pages (Screens)

| File | Purpose | Route |
|------|---------|-------|
| `Dashboard.tsx` | Main screen showing all cards, search bar, and floating "+" button | `/` |
| `AddCard.tsx` | Form to add new card with live preview, camera scanner, barcode format picker | `/add` |
| `CardDetail.tsx` | Full card view with barcode, Clearbit logo, delete confirmation | `/card/:id` |
| `Settings.tsx` | Stats dashboard, "Delete All Data" button | `/settings` |

### Components

| File | Purpose | Used In |
|------|---------|---------|
| `ScannerModal.tsx` | Full-screen camera scanner using html5-qrcode library | AddCard |

### Services (Data Layer)

| File | Purpose |
|------|---------|
| `storage.ts` | All LocalStorage operations - create, read, update, delete cards |
| `brandService.ts` | Fetches logos from Clearbit, manages brand colors |
| `barcodeService.ts` | Auto-detects barcode format from card number |

---

## How to Modify Common Things

### Want to change the app colors?

**File:** `src/index.css`

```css
:root {
  --background: #000000;       /* App background */
  --surface: #0f172a;          /* Card/input backgrounds */
  --primary: #3b82f6;          /* Blue accent color */
  --primary-dark: #2563eb;     /* Button backgrounds */
}
```

### Want to add a new brand color?

**File:** `src/services/brandService.ts`

Add to the `BRAND_COLORS` object:
```typescript
const BRAND_COLORS: Record<string, string> = {
  'ikea': '#0058A3',
  'your-store': '#FF0000',  // Add here
  // ...
};
```

### Want to change the card gradient colors?

**File:** `src/pages/AddCard.tsx`

Find the `getBrandGradient()` function:
```typescript
function getBrandGradient(storeName: string): string {
  const name = storeName.toLowerCase();
  if (name.includes('ikea')) return 'from-blue-600 to-yellow-500';
  if (name.includes('your-store')) return 'from-red-500 to-pink-500';
  // ...
}
```

### Want to add a new barcode format?

**File:** `src/types/card.ts`
```typescript
export type BarcodeFormat = 'CODE128' | 'EAN13' | 'YOUR_FORMAT';
```

**File:** `src/services/barcodeService.ts`
```typescript
// Add detection logic in detectBarcodeFormat()
// Add display name in getFormatDisplayName()
// Add to getAllFormats() array
```

### Want to change the scanner appearance?

**File:** `src/components/ScannerModal.tsx`

Key classes to modify:
- Scanning box size: `w-[85%] max-w-sm aspect-[1.8]`
- Corner markers: `border-blue-500` (change color)
- Laser line: `bg-red-500/80` (change to any color)

### Want to change the floating button (FAB)?

**File:** `src/pages/Dashboard.tsx`

Find the FAB near the bottom:
```tsx
<Link
  to="/add"
  className="w-16 h-16 bg-blue-600 rounded-full ..."
>
```

### Want to add a new page/route?

1. Create page in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
```

---

## Data Storage

All data is stored in `localStorage` under the key `LOCAL_WALLET_CARDS`.

### Card Object Structure
```typescript
interface Card {
  id: string;              // Unique ID (timestamp + random)
  storeName: string;       // "IKEA", "Target", etc.
  cardNumber: string;      // The barcode number
  logoUrl: string | null;  // Clearbit logo URL
  brandColor: string;      // Hex color or Tailwind gradient
  barcodeFormat: BarcodeFormat;  // 'CODE128', 'EAN13', etc.
  isFavorite: boolean;     // Pinned to top
  createdAt: number;       // Timestamp
  lastUsedAt: number | null;  // Last viewed timestamp
}
```

### Storage Functions (in `storage.ts`)

| Function | What it does |
|----------|--------------|
| `getAllCards()` | Get all cards, sorted by favorite > last used > created |
| `createCard(input)` | Create new card with auto-fetched logo/color |
| `getCardById(id)` | Get single card by ID |
| `updateCard(id, updates)` | Partial update a card |
| `deleteCard(id)` | Delete a card |
| `toggleFavorite(id)` | Toggle favorite status |
| `markAsUsed(id)` | Update lastUsedAt timestamp |
| `exportCards()` | Export all cards as JSON string |
| `importCards(json)` | Import cards from JSON string |

---

## Styling System

### CSS Classes (in `index.css`)

| Class | Purpose |
|-------|---------|
| `pt-safe-top` | Padding for iPhone notch |
| `pb-safe-bottom` | Padding for home indicator |
| `active-shrink` | Button press animation (scale 0.95) |
| `blur-header` | Frosted glass header effect |
| `input-native` | 56px tall native-style input |
| `card-aspect` | Credit card aspect ratio (1.586) |

### Tailwind Patterns Used

- **Gradients:** `bg-gradient-to-br from-blue-600 to-yellow-500`
- **Shadows:** `shadow-2xl shadow-blue-500/50`
- **Backdrop blur:** `backdrop-blur-xl bg-black/80`
- **Safe areas:** `pt-safe-top pb-safe-bottom`

---

## External Services

### Clearbit Logo API
```
https://logo.clearbit.com/{company}.com
```
Used in: `CardPreview` components, `CardDetail.tsx`

### html5-qrcode Library
Used for camera scanning in `ScannerModal.tsx`

### react-barcode Library
Used to render barcodes in `CardDetail.tsx`

---

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Build output goes to `dist/` folder. Deploy this to any static host (Vercel, Netlify, GitHub Pages).

---

## PWA Features

- **Offline:** Works without internet (service worker caches everything)
- **Installable:** "Add to Home Screen" on iOS/Android
- **Safe areas:** Handles iPhone notch and home indicator

PWA config is in `vite.config.ts` under `VitePWA` plugin.
