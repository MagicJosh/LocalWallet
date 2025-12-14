# LocalWalletPWA UI Audit & Update Plan

Date: 2025-12-14

## Baseline (current app)

LocalWalletPWA is an offline-first Progressive Web App for storing loyalty/membership cards on-device (intended to be installed to iPhone Home Screen and used like a native app). It’s built with:

- React + TypeScript + Vite
- Tailwind CSS (utility styling)
- Custom `ViewStack` navigation (iOS-style push/pop animations + gestures)
- `html5-qrcode` for camera barcode/QR scanning
- LocalStorage persistence
- Deployed on Vercel

### Current screens (as shown in screenshots)

- **Dashboard** (Wallet home): header with title + settings, search bar, empty state, floating “+” button.
- **Add Card**: live card preview + form fields (store name, card number, barcode format) + “Add to Wallet”.
- **Scanner**: full-screen camera with a custom viewfinder overlay + “Enter Code Manually” fallback modal.
- **Settings**: stats cards + export/import actions + “Delete all data” danger zone.

## Problems observed (from IMG_5777–IMG_5783)

### `IMG_5777.png` – Dashboard layout feels “edge-to-edge”

- Header/search/settings feel like they push toward screen borders.
- On desktop web it looks the same (no “phone-like” max-width / container).
- The UI lacks a consistent “content boundary” so it doesn’t read like an iPhone app.

### `IMG_5778.png` – Add Card form spacing feels cramped

- Store name, card number, barcode format, and action button visually read as one dense block.
- Needs more breathing room and more “iOS form” rhythm (spacing + grouping + safe-area friendly primary action).

### `IMG_5779.png` – Scanner shows two scan boxes

- There’s the custom viewfinder overlay **and** an additional box coming from `html5-qrcode`.
- The default `html5-qrcode` scan-region/shaded overlay should be removed/hidden, keeping the custom viewfinder.

### `IMG_5781.png` – Manual entry modal feels squished/unpolished

- Modal’s spacing and sizing feel too tight.
- Buttons being pill-like is OK, but overall layout needs more consistent sizing and spacing to feel professional.

### `IMG_5782.png` – Cancel from manual entry can lead to a black screen

- After tapping Cancel, the UI can end up fully black with nothing visible.
- Needs a root-cause fix (likely scanner/camera lifecycle / overlay stacking issue).

### `IMG_5783.png` – Settings looks cramped

- Spacing between groups and overall vertical rhythm feels tight.
- Needs more breathing room and a clearer “phone app” layout structure.

## Likely root causes (code-level)

### 1) No consistent “phone app container”

The app uses full-screen fixed layouts, but content is not consistently constrained to a phone-like max width on wide screens. This makes desktop feel edge-to-edge and reduces the “native iPhone” feel.

### 2) `html5-qrcode` overlay not being targeted correctly

Global CSS currently hides `html5-qrcode` default UI by targeting `#reader...` selectors, but the actual scanner mounts into `#scanner-container`. Result: library UI elements (e.g. shaded region) can still appear.

### 3) Duplicate scan box is caused by `qrbox` shaded overlay

The scanner passes a `qrbox` configuration. `html5-qrcode` uses this to render a shaded region element (`#qr-shaded-region`), which can look like a second scan box.

### 4) Black screen after Cancel likely from scanner lifecycle / layering

Most likely causes:

- The camera feed pauses/stops when the keyboard/input opens on iOS, and doesn’t resume cleanly when the modal closes.
- A `html5-qrcode` inserted element ends up covering the UI (stacking context / z-index / DOM cleanup).

## Proposed plan (phone-first; iPhone as the primary target)

1. **Introduce a reusable “phone container” pattern** (max-width + centered content on wide screens, safe-area aware padding) and use it consistently across Dashboard, Add Card, Settings (and optionally Card Detail) so it feels like an iPhone app everywhere.
2. **Add Card screen layout polish**:
   - Increase vertical rhythm between inputs.
   - Ensure the primary action (“Add to Wallet”) has clear separation and respects bottom safe area.
3. **Scanner cleanup**:
   - Remove/hide `html5-qrcode` default shaded region (`#qr-shaded-region`) so only the custom viewfinder remains.
   - Fix CSS selectors to target the actual container (`#scanner-container`) instead of `#reader`.
4. **Manual entry UI polish**:
   - Redesign as an iOS-style bottom sheet (more space, consistent control heights, pill buttons).
5. **Fix black screen after Cancel (root cause)**:
   - Pause scanning when manual entry opens.
   - Resume scanning on close, and add a safe fallback to restart the scanner if the camera feed doesn’t recover on iOS.
6. **Settings spacing polish**:
   - Adjust spacing between sections and cards, consistent with the phone-first container pattern.

## Post-update notes (to be filled after implementation)

### Implemented updates (after baseline)

#### Phone-first layout / spacing

- Added a reusable “phone container” (`.app-container`) so content stays within a phone-like width and gains consistent horizontal padding (including left/right safe-area insets).
  - File: `src/index.css`
- Applied `.app-container` across core screens so headers/forms/settings no longer feel “edge-to-edge” on wide screens.
  - Files: `src/views/Dashboard.tsx`, `src/views/AddCard.tsx`, `src/views/Settings.tsx`, `src/views/CardDetail.tsx`, `src/views/Scanner.tsx`
- Increased vertical rhythm on Add Card and Settings (more breathing room between elements and sections).
  - Files: `src/views/AddCard.tsx`, `src/views/Settings.tsx`

#### Scanner fixes (double box, manual entry polish, black screen mitigation)

- Removed the extra “default” scan box from `html5-qrcode` by hiding the shaded-region overlay element.
  - File: `src/index.css` (hides `#qr-shaded-region`)
- Updated `html5-qrcode` CSS overrides to target the actual mount point (`#scanner-container`) and ensure video covers the available area.
  - File: `src/index.css`
- Redesigned the manual entry UI as an iOS-style bottom sheet with more spacing and consistent control sizing.
  - File: `src/views/Scanner.tsx`
- Mitigated the “black screen after Cancel” by pausing the scanner while manual entry is open, then resuming it on close with a fallback auto-restart if video/scanner appears stalled (common on iOS when the keyboard interrupts camera playback).
  - File: `src/views/Scanner.tsx`
- Aligned scan region behavior with the custom viewfinder (dynamic `qrbox` sizing) and corrected the camera `aspectRatio` to `width/height`.
  - File: `src/views/Scanner.tsx`

