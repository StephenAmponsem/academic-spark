import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Performance optimization utilities
export const preloadRoute = (routePath: string) => {
  // Preload route components for faster navigation
  const routeMap: Record<string, () => Promise<any>> = {
    '/': () => import('../pages/Index'),
    '/auth': () => import('../pages/Auth'),
    '/dashboard': () => import('../pages/Dashboard'),
    '/analytics': () => import('../pages/Analytics'),
    '/search': () => import('../pages/Search'),
    '/forums': () => import('../pages/Forums'),
    '/settings': () => import('../pages/Settings'),
    '/collaboration': () => import('../pages/Collaboration'),
    '/ai-tutor': () => import('../pages/AITutor'),
    '/learning-paths': () => import('../pages/LearningPaths'),
    '/my-learning': () => import('../pages/MyLearning'),
  };

  const preloadFn = routeMap[routePath];
  if (preloadFn) {
    // Use requestIdleCallback for non-blocking preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadFn());
    } else {
      setTimeout(() => preloadFn(), 100);
    }
  }
};

// Debounced navigation for better performance
export const debouncedNavigate = (() => {
  let timeoutId: NodeJS.Timeout;
  return (navigate: Function, path: string, delay: number = 100) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => navigate(path), delay);
  };
})();

// Route transition optimization
export const optimizeRouteTransition = (callback: () => void) => {
  // Use requestAnimationFrame for smooth transitions
  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 16); // ~60fps fallback
  }
};
