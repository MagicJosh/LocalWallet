# Architecture Plan: LocalWalletPWA UI & Scanner Fixes

## Overview
Fix the camera scanner black screen issue on iOS Safari, improve UI spacing throughout the app, and configure optimal Vercel deployment settings.

---

## Issue Analysis (from IMG_5784-5787)

### IMG_5784 - Dashboard
- **Observed:** Search bar placeholder text overlaps with search icon ("Se**a**rch cards...")
- **Observed:** Header spacing looks reasonable but could use more top padding after safe-area
- **Status:** Minor polish needed

### IMG_5785 - Add Card
- **Observed:** "PREVIEW" label and dots below card preview look cluttered
- **Observed:** Form fields (Store Name, Card Number, Barcode Format, Add to Wallet) are stacked too tightly
- **Observed:** Labels like "STORE NAME" are too close to input fields above them
- **Status:** Needs increased vertical rhythm

### IMG_5786 - Scanner (BLACK SCREEN)
- **Critical:** After accepting camera permission, screen goes completely black
- **Root cause:** `html5-qrcode` library has known issues on iOS Safari with:
  1. Video element not receiving proper dimensions
  2. Camera stream not rendering in the DOM properly
  3. The `opacity: hasPermission ? 1 : 0` line hides the container but `hasPermission` stays `null` during initialization
- **Status:** Critical bug - needs fix

### IMG_5787 - Settings
- **Observed:** Stats cards (0 CARDS, OFFLINE) are too close to header
- **Observed:** "DATA MANAGEMENT" label is touching the stats cards
- **Observed:** Sections need more breathing room between them
- **Status:** Needs increased vertical spacing

---

## Vercel Framework Preset Recommendation

**Recommended: Vite** (what you're already using)

This is the correct choice. Here's why:

| Preset | Use Case | Fits LocalWalletPWA? |
|--------|----------|---------------------|
| **Vite** | Modern SPA with React, fast builds | **YES - Perfect match** |
| Create React App | Legacy React projects | No - deprecated |
| Next.js | SSR/SSG, API routes needed | No - overkill for client-only PWA |
| Astro | Content-heavy sites | No - not a content site |
| Angular | Angular framework | No - this is React |
| Remix | Full-stack React with SSR | No - overkill |

**Keep using Vite preset.** Your `vite.config.ts` is correctly configured with:
- `@vitejs/plugin-react` for React
- `@tailwindcss/vite` for Tailwind
- `vite-plugin-pwa` for PWA features

---

## Approach Options

### Option A: Targeted Fixes (Recommended)
**How it works:** Fix the specific issues identified - scanner black screen and UI spacing - without major refactoring.

**Files to modify:**
- `src/views/Scanner.tsx` - Fix camera initialization and visibility logic
- `src/views/AddCard.tsx` - Increase spacing between form elements
- `src/views/Settings.tsx` - Add more vertical margins between sections
- `src/views/Dashboard.tsx` - Fix search icon overlap, add header spacing
- `src/index.css` - Add utility classes for consistent spacing

**Pros:**
- Minimal risk
- Fast to implement
- Addresses all reported issues

**Cons:**
- Doesn't address potential future issues

**Effort:** Low-Medium

---

### Option B: Spacing System Overhaul
**How it works:** Create a comprehensive spacing system with CSS custom properties and apply consistently across all views.

**Files to create/modify:**
- `src/lib/spacing.ts` - Define spacing scale constants
- `src/index.css` - Add spacing CSS variables (--space-1 through --space-12)
- All view files - Refactor to use new spacing system

**Pros:**
- More maintainable long-term
- Consistent spacing across app
- Easier to adjust globally

**Cons:**
- More work upfront
- Overkill for current app size

**Effort:** Medium

---

### Option C: Alternative Scanner Library (Wild Card)
**How it works:** Replace `html5-qrcode` with a more iOS-friendly alternative like `@aspect-ratio/barcode-detector` (uses native BarcodeDetector API) or `zxing-js/browser`.

**Files to modify:**
- `package.json` - Swap scanner library
- `src/views/Scanner.tsx` - Complete rewrite of scanner logic
- `src/index.css` - Remove html5-qrcode overrides

**Pros:**
- Native BarcodeDetector API is more reliable on iOS Safari
- Smaller bundle size (native API)
- Better camera handling

**Cons:**
- BarcodeDetector API not supported in all browsers (needs polyfill)
- More work to implement
- Risk of introducing new bugs

**Effort:** High

---

## My Recommendation

**Option A: Targeted Fixes** because:
1. The black screen is likely fixable by adjusting the Scanner.tsx visibility/initialization logic
2. Spacing issues are straightforward CSS changes
3. Fastest path to a working app
4. Lower risk than replacing the scanner library

---

## Implementation Phases

### Phase 1: Fix Scanner Black Screen (Critical)
**Root cause analysis:**
```tsx
// Current problematic code:
style={{ opacity: hasPermission ? 1 : 0 }}

// Issue: hasPermission is null during initialization, so opacity is 0
// The camera starts but the container is invisible
```

**Fix approach:**
1. Change visibility logic: show container when `isInitializing` OR `hasPermission === true`
2. Add explicit video element styling to ensure it renders
3. Add a small delay before showing overlay to let video initialize
4. Add error boundary to catch and report camera errors

### Phase 2: UI Spacing Fixes
**Dashboard:**
- Increase padding between header title and search bar
- Fix search icon positioning (move placeholder text right)

**Add Card:**
- Increase `space-y-7` to `space-y-8` or add explicit margins
- Add more space before "Add to Wallet" button (`mt-12` to `mt-16`)
- Remove or simplify the dots below card preview

**Settings:**
- Add `mt-6` after header before stats cards
- Increase spacing between sections (`mt-10` to `mt-12`)
- Add padding inside section containers

### Phase 3: Polish & Test
- Test on actual iPhone 11 Pro
- Verify camera works in iOS Safari
- Check all screens for consistent spacing
- Verify PWA works when installed to Home Screen

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scanner fix doesn't work on iOS | Medium | High | Have manual entry as fallback, test on real device |
| Spacing changes break layout | Low | Medium | Test each change incrementally |
| Vercel deployment issues | Low | Low | Already working, minimal config changes |

---

## Technical Details for Scanner Fix

The black screen happens because:

1. **Initialization race condition:** The `html5-qrcode` library injects a `<video>` element into `#scanner-container`, but our visibility logic (`opacity: hasPermission ? 1 : 0`) hides the container before `hasPermission` is set to `true`.

2. **iOS Safari quirk:** iOS Safari is stricter about video element visibility. If the container is hidden (opacity: 0) when the camera stream attaches, the video may not render properly.

**Proposed code changes:**

```tsx
// Scanner.tsx - Fix visibility logic

// BEFORE:
style={{ opacity: hasPermission ? 1 : 0 }}

// AFTER:
style={{ opacity: isInitializing || hasPermission ? 1 : 0 }}

// Also add explicit check that video is playing:
useEffect(() => {
  if (hasPermission && containerRef.current) {
    const video = containerRef.current.querySelector('video');
    if (video && video.paused) {
      video.play().catch(() => {});
    }
  }
}, [hasPermission]);
```

---

## Questions Before Proceeding

1. Can you confirm the scanner issue happens every time on your iPhone 11 Pro, or is it intermittent?
2. Do you want me to also address the "dots" design below the card preview on Add Card, or keep them?
3. Any specific spacing values you prefer (e.g., iOS default 16pt/20pt rhythm)?

---

Ready to proceed when you say "go" or "approved". Or ask me to revise the plan.
