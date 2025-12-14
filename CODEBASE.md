# LocalWallet PWA - Codebase Documentation

A privacy-first, offline-first Progressive Web App for storing loyalty/membership cards.
Apple Wallet-inspired design with custom spring physics navigation.

---

## Architecture Overview

**Key Design Decisions:**
- **No React Router** - Custom ViewStack navigation with iOS-style push/pop animations
- **React Spring** - Physics-based animations for native feel
- **@use-gesture** - Touch gestures (swipe to go back, swipe to delete)
- **LocalStorage** - All data stays on device, 100% offline
- **Tailwind CSS** - Utility-first styling with custom design tokens

---

## Project Structure

```
LocalWalletPWA/
├── src/
│   ├── lib/                    # Core utilities
│   │   ├── ViewStack.tsx       # Custom navigation system
│   │   └── theme.ts            # Design tokens & brand colors
│   │
│   ├── components/             # Reusable UI components
│   │   └── WalletCard.tsx      # Card component with gestures
│   │
│   ├── views/                  # App screens (pages)
│   │   ├── Dashboard.tsx       # Home - card list
│   │   ├── AddCard.tsx         # Add new card form
│   │   ├── CardDetail.tsx      # View card + barcode
│   │   ├── Scanner.tsx         # Camera barcode scanner
│   │   └── Settings.tsx        # Export/Import/Delete
│   │
│   ├── services/               # Business logic
│   │   ├── storage.ts          # LocalStorage CRUD
│   │   ├── brandService.ts     # Logo fetching
│   │   └── barcodeService.ts   # Barcode format detection
│   │
│   ├── types/                  # TypeScript definitions
│   │   └── card.ts             # Card interface
│   │
│   ├── App.tsx                 # Root component + ViewStack
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── public/                     # Static assets
│   └── icons/                  # PWA icons
│
└── vite.config.ts              # Vite + PWA config
```

---

## Navigation System

### ViewStack (src/lib/ViewStack.tsx)

Custom navigation replacing React Router. Features:
- iOS-style push/pop animations (slide from right)
- Swipe-right to go back gesture
- Spring physics for smooth animations
- View stack management

**Usage:**
```typescript
const { push, pop, replace } = useViewStack();

// Navigate to a view
push('detail', { cardId: '123' });

// Go back
pop();

// Replace current view
replace('dashboard');
```

**View Types:** `dashboard` | `add` | `detail` | `settings` | `scanner`

---

## Key Components

### WalletCard (src/components/WalletCard.tsx)

Credit card-style component with:
- Brand gradient backgrounds
- Clearbit logo integration
- Swipe-left to delete gesture
- Press animation feedback
- Favorite indicator

**Props:**
```typescript
interface WalletCardProps {
  card: Card;
  onClick?: () => void;
  onSwipeDelete?: () => void;
}
```

---

## Views

| View | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Card list with search, FAB to add |
| AddCard | `/add` | Form with live preview, camera scanner |
| CardDetail | `/card/:id` | Barcode display, brightness boost, delete |
| Scanner | `/scanner` | Full-screen camera barcode scanner |
| Settings | `/settings` | Export/Import JSON, delete all data |

---

## Features

### Barcode Scanning
- Uses `html5-qrcode` library
- Supports: CODE128, EAN-13, EAN-8, UPC, CODE39, QR
- Manual entry fallback if camera fails

### Brightness Boost
- Increases screen brightness when viewing barcode
- Uses CSS filter for cross-browser support
- Auto-resets when leaving view

### Export/Import
- Export all cards as JSON file
- Import cards from JSON backup
- Useful for device migration

### Swipe Gestures
- Swipe right: Go back (enabled on all views except scanner)
- Swipe left on card: Delete card

---

## Design Tokens (src/lib/theme.ts)

### Colors
```typescript
colors.background   // #000000 - Pure black
colors.surface      // #1C1C1E - Elevated surface
colors.accent       // #007AFF - iOS blue
colors.error        // #FF3B30 - iOS red
colors.success      // #34C759 - iOS green
```

### Spring Configs
```typescript
springConfigs.ios     // iOS-style spring animation
springConfigs.snappy  // Quick interactions
springConfigs.gentle  // Large movements
```

### Brand Colors
Pre-defined gradients for popular stores:
- IKEA, Coop, Leroy Merlin, Target, Starbucks
- Costco, Walmart, Amazon, Nike, Adidas
- Lidl, Aldi, Carrefour, Decathlon, etc.

---

## Storage (src/services/storage.ts)

All data stored in `localStorage` under key `LOCAL_WALLET_CARDS`.

### Card Object
```typescript
interface Card {
  id: string;
  storeName: string;
  cardNumber: string;
  logoUrl: string | null;
  brandColor: string;        // Tailwind gradient classes
  barcodeFormat: BarcodeFormat;
  isFavorite: boolean;
  createdAt: number;
  lastUsedAt: number | null;
}
```

### Functions
| Function | Description |
|----------|-------------|
| `getAllCards()` | Get all cards (favorites first) |
| `createCard(input)` | Create new card |
| `getCardById(id)` | Get single card |
| `deleteCard(id)` | Delete card |
| `toggleFavorite(id)` | Toggle favorite |
| `markAsUsed(id)` | Update lastUsedAt |
| `exportCards()` | Export as JSON string |
| `importCards(json)` | Import from JSON |

---

## How to Modify

### Add a new brand color
Edit `src/lib/theme.ts`:
```typescript
export const brandColors = {
  'newstore': { gradient: 'from-red-500 to-pink-500', primary: '#FF0000' },
  // ...
};
```

### Add a new barcode format
1. Edit `src/types/card.ts` to add the format type
2. Edit `src/services/barcodeService.ts` to add detection logic

### Change animations
Edit spring configs in `src/lib/theme.ts`:
```typescript
export const springConfigs = {
  ios: { tension: 300, friction: 28, mass: 0.8 },
  // Increase tension = faster, increase friction = more damping
};
```

---

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

Deploy `dist/` folder to Vercel, Netlify, or any static host.

---

## PWA Features

- **Offline:** Service worker caches all assets
- **Installable:** Add to home screen on iOS/Android
- **Safe areas:** Handles iPhone notch and home indicator
- **No tracking:** Zero analytics, no data sent anywhere
