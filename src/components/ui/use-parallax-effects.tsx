import { useState, useEffect, useCallback, useRef } from 'react';
import { useMotionValue, useTransform, useSpring } from 'framer-motion';

export interface ParallaxLayer {
  id: string;
  speed: number;
  depth: number;
  blur?: number;
  opacity?: number;
}

export interface ParallaxConfig {
  layers: ParallaxLayer[];
  scrollSensitivity: number;
  springConfig: {
    stiffness: number;
    damping: number;
    mass: number;
  };
}

const DEFAULT_CONFIG: ParallaxConfig = {
  layers: [
    { id: 'background', speed: 0.2, depth: -100, blur: 2, opacity: 0.3 },
    { id: 'midground', speed: 0.5, depth: -50, blur: 1, opacity: 0.6 },
    { id: 'foreground', speed: 0.8, depth: -20, opacity: 0.9 },
    { id: 'surface', speed: 1.0, depth: 0, opacity: 1.0 }
  ],
  scrollSensitivity: 1.2,
  springConfig: {
    stiffness: 300,
    damping: 30,
    mass: 0.8
  }
};

export const useParallaxEffects = (config: Partial<ParallaxConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [isActive, setIsActive] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);
  
  // Motion values for smooth parallax
  const scrollY = useMotionValue(0);
  const scrollVelocity = useMotionValue(0);
  
  // Spring animations for smooth movement
  const springScrollY = useSpring(scrollY, finalConfig.springConfig);
  
  // Transform values for each layer
  const layerTransforms = finalConfig.layers.map(layer => ({
    id: layer.id,
    y: useTransform(
      springScrollY,
      [0, 1000],
      [0, -1000 * layer.speed * finalConfig.scrollSensitivity]
    ),
    scale: useTransform(
      springScrollY,
      [0, 1000],
      [1, 1 + (layer.depth / 1000) * 0.1]
    ),
    rotateX: useTransform(
      springScrollY,
      [0, 1000],
      [0, layer.depth / 100]
    ),
    blur: useTransform(
      springScrollY,
      [0, 500],
      [layer.blur || 0, (layer.blur || 0) + 2]
    ),
    opacity: useTransform(
      springScrollY,
      [0, 800],
      [layer.opacity || 1, Math.max(0.1, (layer.opacity || 1) - 0.3)]
    )
  }));

  // 3D card stacking effect
  const cardStackTransforms = useTransform(
    springScrollY,
    [0, 300],
    [0, 1]
  );

  const getCardTransform = useCallback((index: number, total: number) => {
    const progress = cardStackTransforms.get();
    const stackOffset = (index / total) * 20;
    const rotationOffset = (index / total) * 5;
    
    return {
      y: useTransform(
        springScrollY,
        [0, 300],
        [stackOffset * progress, stackOffset * progress - 10]
      ),
      rotateX: useTransform(
        springScrollY,
        [0, 300],
        [rotationOffset * progress, rotationOffset * progress + 2]
      ),
      scale: useTransform(
        springScrollY,
        [0, 300],
        [1 - (index * 0.02), 1 - (index * 0.02) + 0.01]
      ),
      zIndex: total - index
    };
  }, [cardStackTransforms, springScrollY]);

  // Depth shadows that respond to scroll
  const shadowIntensity = useTransform(
    springScrollY,
    [0, 500],
    [0.1, 0.8]
  );

  const getShadowStyle = useCallback((depth: number) => {
    const intensity = shadowIntensity.get();
    const shadowDepth = Math.abs(depth) * intensity;
    
    return {
      boxShadow: `
        0 ${shadowDepth * 0.5}px ${shadowDepth * 1.5}px rgba(0, 0, 0, ${0.1 + intensity * 0.2}),
        0 ${shadowDepth * 0.2}px ${shadowDepth * 0.8}px rgba(0, 0, 0, ${0.05 + intensity * 0.1}),
        inset 0 1px 0 rgba(255, 255, 255, ${0.1 - intensity * 0.05})
      `,
      filter: `drop-shadow(0 ${shadowDepth * 0.3}px ${shadowDepth * 0.6}px rgba(0, 0, 0, ${intensity * 0.15}))`
    };
  }, [shadowIntensity]);

  // Scroll event handler
  const handleScroll = useCallback((event: any) => {
    if (!isActive) return;
    
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop || window.pageYOffset;
    const maxScroll = target.scrollHeight - target.clientHeight || document.documentElement.scrollHeight - window.innerHeight;
    
    // Normalize scroll position (0-1)
    const normalizedScroll = Math.min(scrollTop / maxScroll, 1);
    
    // Update motion values
    scrollY.set(normalizedScroll * 1000);
    
    // Calculate velocity for dynamic effects
    const velocity = Math.abs(scrollY.getVelocity());
    scrollVelocity.set(velocity);
  }, [isActive, scrollY, scrollVelocity]);

  // Initialize parallax effects
  const initializeParallax = useCallback((element?: HTMLElement) => {
    if (element) {
      scrollRef.current = element;
    }
    
    const target = scrollRef.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    setIsActive(true);
    
    return () => {
      target.removeEventListener('scroll', handleScroll);
      setIsActive(false);
    };
  }, [handleScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Advanced parallax utilities
  const createLayerStyle = useCallback((layerId: string) => {
    const layer = layerTransforms.find(l => l.id === layerId);
    if (!layer) return {};
    
    return {
      transform: `
        translateY(${layer.y.get()}px) 
        translateZ(${finalConfig.layers.find(l => l.id === layerId)?.depth || 0}px)
        scale(${layer.scale.get()}) 
        rotateX(${layer.rotateX.get()}deg)
      `,
      filter: `blur(${layer.blur.get()}px)`,
      opacity: layer.opacity.get(),
      willChange: 'transform, filter, opacity'
    };
  }, [layerTransforms, finalConfig.layers]);

  // Magnetic hover effect for premium feel
  const createMagneticEffect = useCallback((strength: number = 0.3) => {
    return {
      onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;
        
        e.currentTarget.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = 'translate(0px, 0px) scale(1)';
      }
    };
  }, []);

  return {
    isActive,
    scrollY: springScrollY,
    scrollVelocity,
    layerTransforms,
    initializeParallax,
    createLayerStyle,
    getCardTransform,
    getShadowStyle,
    createMagneticEffect,
    shadowIntensity
  };
};

export default useParallaxEffects;
