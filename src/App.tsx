/**
 * LocalWallet - Apple Wallet-style PWA
 *
 * A privacy-first, offline-first loyalty card wallet.
 * No ads. No tracking. Your data stays on your device.
 *
 * Architecture:
 * - Custom ViewStack navigation (iOS-style push/pop with spring physics)
 * - React Spring for animations
 * - @use-gesture for swipe gestures
 * - LocalStorage for persistence
 */

import { ViewStackProvider, AnimatedView, useViewStack } from './lib/ViewStack';

// Views
import { Dashboard } from './views/Dashboard';
import { AddCard } from './views/AddCard';
import { CardDetail } from './views/CardDetail';
import { Settings } from './views/Settings';
import { Scanner } from './views/Scanner';

// View renderer component
function ViewRenderer() {
  const { views, pop, canGoBack } = useViewStack();

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {views.map((view, index) => (
        <AnimatedView
          key={view.key}
          isActive={index === views.length - 1}
          index={index}
          totalViews={views.length}
          onSwipeBack={canGoBack ? pop : undefined}
          enableSwipeBack={view.type !== 'scanner'} // Disable swipe on scanner
        >
          {view.type === 'dashboard' && <Dashboard />}
          {view.type === 'add' && <AddCard />}
          {view.type === 'detail' && <CardDetail />}
          {view.type === 'settings' && <Settings />}
          {view.type === 'scanner' && <Scanner />}
        </AnimatedView>
      ))}
    </div>
  );
}

// Main App component
export default function App() {
  return (
    <ViewStackProvider initialView="dashboard">
      <ViewRenderer />
    </ViewStackProvider>
  );
}
