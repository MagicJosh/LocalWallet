/**
 * ViewStack - iOS-style Navigation with Spring Physics
 *
 * This replaces React Router with a custom view stack that mimics
 * iOS navigation: views slide in from the right, stack on top of each other,
 * and can be dismissed with a swipe-right gesture.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { useDrag } from '@use-gesture/react';

// View types for the app
export type ViewType = 'dashboard' | 'add' | 'detail' | 'settings' | 'scanner';

interface ViewState {
  type: ViewType;
  params?: Record<string, unknown>;
  key: string;
}

interface ViewStackContextType {
  views: ViewState[];
  push: (view: ViewType, params?: Record<string, unknown>) => void;
  pop: () => void;
  popToRoot: () => void;
  replace: (view: ViewType, params?: Record<string, unknown>) => void;
  currentView: ViewState;
  canGoBack: boolean;
}

const ViewStackContext = createContext<ViewStackContextType | null>(null);

export function useViewStack() {
  const context = useContext(ViewStackContext);
  if (!context) {
    throw new Error('useViewStack must be used within ViewStackProvider');
  }
  return context;
}

interface ViewStackProviderProps {
  children: ReactNode;
  initialView?: ViewType;
}

export function ViewStackProvider({ children, initialView = 'dashboard' }: ViewStackProviderProps) {
  const [views, setViews] = useState<ViewState[]>([
    { type: initialView, key: `${initialView}-${Date.now()}` }
  ]);

  const push = useCallback((type: ViewType, params?: Record<string, unknown>) => {
    setViews(prev => [...prev, { type, params, key: `${type}-${Date.now()}` }]);
  }, []);

  const pop = useCallback(() => {
    setViews(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const popToRoot = useCallback(() => {
    setViews(prev => [prev[0]]);
  }, []);

  const replace = useCallback((type: ViewType, params?: Record<string, unknown>) => {
    setViews(prev => [...prev.slice(0, -1), { type, params, key: `${type}-${Date.now()}` }]);
  }, []);

  const currentView = views[views.length - 1];
  const canGoBack = views.length > 1;

  return (
    <ViewStackContext.Provider value={{ views, push, pop, popToRoot, replace, currentView, canGoBack }}>
      {children}
    </ViewStackContext.Provider>
  );
}

// Animated view wrapper with swipe-to-go-back
interface AnimatedViewProps {
  children: ReactNode;
  isActive: boolean;
  index: number;
  totalViews: number;
  onSwipeBack?: () => void;
  enableSwipeBack?: boolean;
}

export function AnimatedView({
  children,
  isActive,
  index,
  totalViews,
  onSwipeBack,
  enableSwipeBack = true
}: AnimatedViewProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Calculate position based on stack index
  const isTopView = index === totalViews - 1;
  const isSecondView = index === totalViews - 2;

  // Spring animation for view position
  const [spring, api] = useSpring(() => ({
    x: isTopView ? 0 : isSecondView ? -80 : -160,
    scale: isTopView ? 1 : isSecondView ? 0.94 : 0.88,
    opacity: isActive ? 1 : isTopView ? 1 : isSecondView ? 0.8 : 0,
    config: { ...config.stiff, clamp: true }
  }));

  // Update spring when view position changes
  useSpring(() => {
    if (!isDragging) {
      api.start({
        x: isTopView ? 0 : isSecondView ? -80 : -160,
        scale: isTopView ? 1 : isSecondView ? 0.94 : 0.88,
        opacity: isTopView ? 1 : isSecondView ? 0.8 : 0,
      });
    }
  });

  // Drag gesture for swipe-back
  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (!enableSwipeBack || !isTopView || index === 0) return;

      setIsDragging(active);

      if (active) {
        // Only allow dragging right
        const clampedX = Math.max(0, mx);
        // Calculate progress (0 to 1)
        const progress = Math.min(clampedX / window.innerWidth, 1);

        api.start({
          x: clampedX,
          scale: 1,
          opacity: 1 - progress * 0.3,
          immediate: true
        });
      } else {
        // Released - check if we should complete the swipe
        const shouldDismiss = mx > window.innerWidth * 0.3 || (vx > 0.5 && dx > 0);

        if (shouldDismiss && onSwipeBack) {
          // Animate out and call callback
          api.start({
            x: window.innerWidth,
            opacity: 0,
            config: { tension: 200, friction: 25 },
            onRest: onSwipeBack
          });
        } else {
          // Snap back
          api.start({
            x: 0,
            scale: 1,
            opacity: 1,
            config: config.stiff
          });
        }
      }
    },
    {
      axis: 'x',
      from: () => [spring.x.get(), 0],
      bounds: { left: 0 },
      rubberband: true
    }
  );

  // Don't render views that are too far back in the stack
  if (index < totalViews - 3) return null;

  return (
    <animated.div
      {...(enableSwipeBack && isTopView && index > 0 ? bind() : {})}
      style={{
        position: 'fixed',
        inset: 0,
        x: spring.x,
        scale: spring.scale,
        opacity: spring.opacity,
        zIndex: 10 + index,
        touchAction: 'pan-y',
        willChange: 'transform',
      }}
      className="bg-black overflow-hidden"
    >
      {/* Edge indicator for swipe gesture */}
      {enableSwipeBack && isTopView && index > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-5 z-50"
          style={{ touchAction: 'pan-x' }}
        />
      )}
      {children}
    </animated.div>
  );
}
