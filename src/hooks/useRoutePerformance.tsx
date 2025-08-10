import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface RoutePerformanceMetrics {
  route: string;
  loadTime: number;
  timestamp: number;
}

export const useRoutePerformance = () => {
  const location = useLocation();
  const routeStartTime = useRef<number>(0);
  const metrics = useRef<RoutePerformanceMetrics[]>([]);

  const startRouteTimer = useCallback(() => {
    routeStartTime.current = performance.now();
  }, []);

  const endRouteTimer = useCallback((route: string) => {
    if (routeStartTime.current > 0) {
      const loadTime = performance.now() - routeStartTime.current;
      const metric: RoutePerformanceMetrics = {
        route,
        loadTime,
        timestamp: Date.now(),
      };
      
      metrics.current.push(metric);
      
      // Log slow routes for debugging
      if (loadTime > 1000) {
        console.warn(`🐌 Slow route detected: ${route} took ${loadTime.toFixed(2)}ms`);
      } else {
        console.log(`⚡ Route loaded: ${route} in ${loadTime.toFixed(2)}ms`);
      }
      
      // Keep only last 50 metrics to prevent memory issues
      if (metrics.current.length > 50) {
        metrics.current = metrics.current.slice(-50);
      }
      
      routeStartTime.current = 0;
    }
  }, []);

  const getRouteMetrics = useCallback(() => {
    return metrics.current;
  }, []);

  const getAverageLoadTime = useCallback(() => {
    if (metrics.current.length === 0) return 0;
    const total = metrics.current.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / metrics.current.length;
  }, []);

  const getSlowestRoute = useCallback(() => {
    if (metrics.current.length === 0) return null;
    return metrics.current.reduce((slowest, current) => 
      current.loadTime > slowest.loadTime ? current : slowest
    );
  }, []);

  // Monitor route changes
  useEffect(() => {
    const currentRoute = location.pathname;
    
    // End timer for previous route if exists
    if (routeStartTime.current > 0) {
      endRouteTimer(currentRoute);
    }
    
    // Start timer for new route
    startRouteTimer();
    
    // End timer after a short delay to capture initial render
    const timer = setTimeout(() => {
      endRouteTimer(currentRoute);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname, startRouteTimer, endRouteTimer]);

  return {
    startRouteTimer,
    endRouteTimer,
    getRouteMetrics,
    getAverageLoadTime,
    getSlowestRoute,
  };
};
