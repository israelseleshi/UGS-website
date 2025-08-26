"use client";

import * as React from "react";

interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGestureOptions {
  threshold?: number;
  velocity?: number;
  preventScroll?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: (position: TouchPosition) => void;
  onSwipeEnd?: () => void;
}

export function useMobileGestures(options: SwipeGestureOptions = {}) {
  const {
    threshold = 50,
    velocity = 0.3,
    preventScroll = false,
    onSwipeLeft,
    onSwipeRight,
    onSwipeStart,
    onSwipeEnd,
  } = options;

  const touchStart = React.useRef<TouchPosition | null>(null);
  const touchEnd = React.useRef<TouchPosition | null>(null);
  const isTracking = React.useRef(false);

  // Haptic feedback utility
  const triggerHapticFeedback = React.useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
    
    // For iOS devices with haptic feedback API
    if ('hapticFeedback' in window) {
      try {
        (window as any).hapticFeedback.impact(type);
      } catch (e) {
        // Fallback silently
      }
    }
  }, []);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const position: TouchPosition = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
    
    touchStart.current = position;
    touchEnd.current = null;
    isTracking.current = true;
    
    onSwipeStart?.(position);
    triggerHapticFeedback('light');
  }, [onSwipeStart, triggerHapticFeedback]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isTracking.current || !touchStart.current) return;

    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    // Prevent scrolling if specified
    if (preventScroll) {
      const deltaX = Math.abs(touch.clientX - touchStart.current.x);
      const deltaY = Math.abs(touch.clientY - touchStart.current.y);
      
      // If horizontal movement is greater than vertical, prevent scroll
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  }, [preventScroll]);

  const handleTouchEnd = React.useCallback(() => {
    if (!touchStart.current || !touchEnd.current || !isTracking.current) {
      isTracking.current = false;
      return;
    }

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.timestamp - touchStart.current.timestamp;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const swipeVelocity = distance / deltaTime;
    
    // Check if it's a horizontal swipe
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    
    if (isHorizontalSwipe && Math.abs(deltaX) > threshold && swipeVelocity > velocity) {
      if (deltaX > 0) {
        // Swipe right
        triggerHapticFeedback('medium');
        onSwipeRight?.();
      } else {
        // Swipe left
        triggerHapticFeedback('medium');
        onSwipeLeft?.();
      }
    }

    onSwipeEnd?.();
    isTracking.current = false;
    touchStart.current = null;
    touchEnd.current = null;
  }, [threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeEnd, triggerHapticFeedback]);

  const gestureHandlers = React.useMemo(() => ({
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  }), [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    gestureHandlers,
    triggerHapticFeedback,
    isTracking: isTracking.current,
  };
}

// Enhanced mobile detection with gesture support
export function useEnhancedMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  const [supportsTouch, setSupportsTouch] = React.useState(false);
  const [supportsHaptics, setSupportsHaptics] = React.useState(false);

  React.useEffect(() => {
    const checkMobileFeatures = () => {
      // Check if device is mobile
      const mql = window.matchMedia('(max-width: 767px)');
      setIsMobile(mql.matches);

      // Check touch support
      setSupportsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);

      // Check haptic support
      setSupportsHaptics(
        'vibrate' in navigator || 
        'hapticFeedback' in window ||
        /iPhone|iPad|iPod/.test(window.navigator.userAgent)
      );

      const handleResize = () => setIsMobile(mql.matches);
      mql.addEventListener('change', handleResize);
      return () => mql.removeEventListener('change', handleResize);
    };

    const cleanup = checkMobileFeatures();
    return cleanup;
  }, []);

  return {
    isMobile: !!isMobile,
    supportsTouch,
    supportsHaptics,
  };
}
