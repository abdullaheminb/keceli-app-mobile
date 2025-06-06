/**
 * Performance Monitor Hook
 * 
 * Performans ölçümü ve monitoring için hook.
 * Development modda performans metriklerini loglar.
 * 
 * @features
 * - Load time measurement
 * - Re-render counting
 * - Memory usage tracking
 * 
 * @purpose Performance monitoring and optimization
 */

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  loadTime: number;
  renderCount: number;
}

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());
  const mounted = useRef(false);

  // Count renders
  renderCount.current += 1;

  useEffect(() => {
    if (!mounted.current) {
      // First mount
      mounted.current = true;
      const loadTime = Date.now() - startTime.current;
      
      if (__DEV__) {
        console.log(`🚀 Performance [${componentName}]:`, {
          loadTime: `${loadTime}ms`,
          renderCount: renderCount.current
        });
      }
    }
  }, [componentName]);

  useEffect(() => {
    return () => {
      if (__DEV__) {
        console.log(`🏁 Unmounted [${componentName}]:`, {
          totalRenders: renderCount.current,
          totalTime: `${Date.now() - startTime.current}ms`
        });
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    loadTime: Date.now() - startTime.current
  };
}

export default usePerformanceMonitor; 