"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, Menu, User, Settings, LogOut, Mic, MicOff, Fingerprint, Eye, Zap } from 'lucide-react';
import { cn } from '../utils/utils.ts';
import { useMobileGestures, useEnhancedMobile } from './use-mobile-gestures.tsx';
import { useBiometricAuth } from './use-biometric-auth.tsx';
import { useParallaxEffects } from './use-parallax-effects.tsx';

interface EnhancedMobileSidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  className?: string;
  overlayClassName?: string;
  width?: string;
  onNavigate?: (route: string) => void;
}

export function EnhancedMobileSidebar({
  children,
  isOpen,
  onOpenChange,
  side = "right",
  className,
  overlayClassName,
  width = "320px",
  onNavigate,
}: EnhancedMobileSidebarProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragProgress, setDragProgress] = React.useState(0);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Enhanced mobile detection
  const { isMobile, supportsTouch, supportsHaptics } = useEnhancedMobile();

  // Enhanced gesture handling
  const { gestureHandlers, triggerHapticFeedback } = useMobileGestures({
    onSwipeRight: () => onOpenChange(false),
    onSwipeLeft: () => onOpenChange(false),
    threshold: 50,
    velocity: 0.3
  });

  // Biometric authentication
  const {
    capabilities,
    isListening,
    authenticateFingerprint,
    authenticateFaceId,
    startVoiceRecognition,
    stopVoiceRecognition,
    triggerQuickAction
  } = useBiometricAuth();

  // Parallax depth effects
  const {
    initializeParallax,
    createLayerStyle,
    getCardTransform,
    getShadowStyle,
    createMagneticEffect,
    shadowIntensity
  } = useParallaxEffects({
    layers: [
      { id: 'background', speed: 0.1, depth: -80, blur: 3, opacity: 0.2 },
      { id: 'midground', speed: 0.4, depth: -40, blur: 1, opacity: 0.7 },
      { id: 'foreground', speed: 0.8, depth: -10, opacity: 0.95 },
      { id: 'surface', speed: 1.0, depth: 0, opacity: 1.0 }
    ]
  });

  // Handle drag gestures for smooth sidebar interaction
  const handleDrag = React.useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!supportsTouch) return;

      const { offset, velocity } = info;
      const dragDistance = side === "right" ? -offset.x : offset.x;
      const maxDrag = 320; // Sidebar width
      
      // Calculate drag progress (0 to 1)
      const progress = Math.max(0, Math.min(1, dragDistance / maxDrag));
      setDragProgress(progress);
    },
    [side, supportsTouch]
  );

  const handleDragEnd = React.useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!supportsTouch) return;

      const { offset, velocity } = info;
      const dragDistance = side === "right" ? -offset.x : offset.x;
      const velocityThreshold = 500;
      const distanceThreshold = 160; // Half of sidebar width

      // Determine if sidebar should open/close based on drag distance and velocity
      const shouldToggle = 
        Math.abs(velocity.x) > velocityThreshold || 
        Math.abs(dragDistance) > distanceThreshold;

      if (shouldToggle) {
        const shouldOpen = dragDistance > 0;
        if (shouldOpen !== isOpen) {
          onOpenChange(shouldOpen);
        }
      }

      setIsDragging(false);
      setDragProgress(0);
    },
    [side, isOpen, onOpenChange, supportsTouch]
  );

  // Keyboard accessibility
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Initialize parallax effects when sidebar opens
      initializeParallax();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange, initializeParallax]);

  // Voice command handler
  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case 'closeMenu':
        onOpenChange(false);
        break;
      case 'navigateHome':
        onNavigate?.('home');
        onOpenChange(false);
        break;
      case 'signIn':
        onNavigate?.('signin');
        onOpenChange(false);
        break;
      case 'getStarted':
        onNavigate?.('signup');
        onOpenChange(false);
        break;
      default:
        console.log('Unknown voice command:', command);
    }
  };

  // Biometric quick actions
  const handleBiometricAction = async (action: string) => {
    const result = await triggerQuickAction(action);
    if (result.success) {
      handleVoiceCommand(action);
    }
  };

  // Don't render on desktop
  if (!isMobile) return null;

  const sidebarVariants = {
    closed: {
      x: side === "right" ? "100%" : "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className={cn(
              "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
              overlayClassName
            )}
            onClick={() => onOpenChange(false)}
          />

          {/* Enhanced Sidebar with Parallax Effects */}
          <motion.div
            ref={sidebarRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            {...gestureHandlers}
            className={cn(
              "fixed top-0 z-50 h-full shadow-xl",
              "flex flex-col overflow-hidden",
              side === "right" ? "right-0" : "left-0",
              className
            )}
            style={{
              width,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.2)',
              ...createLayerStyle('surface')
            }}
          >
            {/* Parallax Background Layers */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-pink-500/5 to-orange-500/10"
                style={createLayerStyle('background')}
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-gray-900/5 to-transparent"
                style={createLayerStyle('midground')}
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
                style={createLayerStyle('foreground')}
              />
            </div>
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Menu className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Navigation
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHapticFeedback('light');
                  onOpenChange(false);
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                  "active:bg-gray-200 dark:active:bg-gray-700"
                )}
                aria-label="Close navigation"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4">
                {children}
              </div>
            </div>

            {/* Drag indicator */}
            {supportsTouch && (
              <div className="absolute top-1/2 -translate-y-1/2 w-1 h-12 bg-gray-300 dark:bg-gray-600 rounded-full opacity-30"
                   style={{ [side]: '-4px' }} />
            )}

            {/* Gesture hint for first-time users */}
            {supportsTouch && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.6, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 1, duration: 2 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                Swipe {side === "right" ? "right" : "left"} to close
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Enhanced trigger button with haptic feedback
interface EnhancedSidebarTriggerProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
}

export function EnhancedSidebarTrigger({
  onClick,
  className,
  children,
  "aria-label": ariaLabel = "Toggle navigation",
}: EnhancedSidebarTriggerProps) {
  const { triggerHapticFeedback } = useMobileGestures();

  const handleClick = React.useCallback(() => {
    triggerHapticFeedback('light');
    onClick();
  }, [onClick, triggerHapticFeedback]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        "p-2 rounded-lg transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
        "active:bg-gray-200 dark:active:bg-gray-700",
        className
      )}
      aria-label={ariaLabel}
    >
      {children || <Menu className="w-5 h-5" />}
    </motion.button>
  );
}
