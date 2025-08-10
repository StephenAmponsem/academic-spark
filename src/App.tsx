import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import useAuth from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense, memo, useMemo, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useRoutePerformance } from "@/hooks/useRoutePerformance";

// Lazy load all page components for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyLearning = lazy(() => import("./pages/MyLearning"));
const Search = lazy(() => import("./pages/Search"));
const Settings = lazy(() => import("./pages/Settings"));
const Forums = lazy(() => import("./pages/Forums"));
const Whiteboard = lazy(() => import("./pages/Whiteboard"));
const VideoConference = lazy(() => import("./pages/VideoConference"));
const ExamProctoring = lazy(() => import("./pages/ExamProctoring"));
const AITutor = lazy(() => import("./pages/AITutor"));
const AIQA = lazy(() => import("./pages/AIQA"));
const LearningPaths = lazy(() => import("./pages/LearningPaths"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Collaboration = lazy(() => import("./pages/Collaboration"));
const LecturerAuth = lazy(() => import("./pages/LecturerAuth"));
const StudentAuth = lazy(() => import("./pages/StudentAuth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RealTimeCourses = lazy(() => import("./components/RealTimeCourses").then(module => ({ default: module.RealTimeCourses })));

// Loading component for lazy routes
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" variant="gradient" />
  </div>
);

// Route preloader for faster navigation
const RoutePreloader = () => {
  useEffect(() => {
    // Preload common routes in the background
    const preloadRoutes = () => {
      // Use requestIdleCallback for non-blocking preloading
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Preload dashboard and common routes
          import("./pages/Dashboard");
          import("./pages/MyLearning");
          import("./pages/Search");
        });
      } else {
        // Fallback for older browsers
        setTimeout(() => {
          import("./pages/Dashboard");
          import("./pages/MyLearning");
          import("./pages/Search");
        }, 1000);
      }
    };

    preloadRoutes();
  }, []);

  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Performance monitoring wrapper
const PerformanceMonitor = ({ children }: { children: React.ReactNode }) => {
  const { getAverageLoadTime, getSlowestRoute } = useRoutePerformance();
   
  useEffect(() => {
    // Log performance metrics periodically
    const interval = setInterval(() => {
      const avgTime = getAverageLoadTime();
      const slowest = getSlowestRoute();
       
      if (avgTime > 0) {
        console.log(`📊 Route Performance - Average: ${avgTime.toFixed(2)}ms`);
        if (slowest && slowest.loadTime > 1000) {
          console.warn(`🐌 Slowest route: ${slowest.route} (${slowest.loadTime.toFixed(2)}ms)`);
        }
      }
    }, 30000); // Log every 30 seconds
    
    return () => clearInterval(interval);
  }, [getAverageLoadTime, getSlowestRoute]);
   
  return <>{children}</>;
};

// Optimized ProtectedRoute component with memoization
const ProtectedRoute = memo(({ children, requiredRole }: { children: JSX.Element, requiredRole?: string }) => {
  const { role, loading, user } = useAuth();
   
  // Memoize the loading state to prevent unnecessary re-renders
  const loadingState = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  ), []);
   
  // Memoize the access denied state
  const accessDeniedState = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-muted-foreground">
          Required role: {requiredRole} | Your role: {role || 'none'}
        </p>
        <button 
          onClick={() => window.history.back()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    </div>
  ), [requiredRole, role]);
   
  if (loading) {
    return loadingState;
  }
   
  // If no user is logged in, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
   
  // If no specific role is required, just check authentication
  if (!requiredRole) {
    return children;
  }
   
  // Check role-based access with flexible permissions
  const hasAccess = checkRoleAccess(role, requiredRole);
   
  if (!hasAccess) {
    return accessDeniedState;
  }
   
  return children;
});

ProtectedRoute.displayName = 'ProtectedRoute';

// Helper function to check role-based access with hierarchy
function checkRoleAccess(userRole: string | null, requiredRole: string): boolean {
  if (!userRole) return false;
   
  // Role hierarchy: admin > instructor > student
  const roleHierarchy = {
    'admin': 3,
    'instructor': 2, 
    'student': 1
  };
   
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
   
  // Users can access their own role level and below
  return userLevel >= requiredLevel;
}

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <RoutePreloader />
              <PerformanceMonitor>
                <AuthProvider>
                  <Routes>
                    <Route path="/" element={
                      <Suspense fallback={<RouteLoader />}>
                        <Index />
                      </Suspense>
                    } />
                    <Route path="/auth" element={
                      <Suspense fallback={<RouteLoader />}>
                        <Auth />
                      </Suspense>
                    } />
                    <Route path="/dashboard" element={
                      <Suspense fallback={<RouteLoader />}>
                        <Dashboard />
                      </Suspense>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <Analytics />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/search" element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <Search />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/forums" element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <Forums />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <Suspense fallback={<RouteLoader />}>
                        <Settings />
                      </Suspense>
                    } />
                    <Route path="/collaboration" element={
                      <ProtectedRoute requiredRole="student">
                        <Suspense fallback={<RouteLoader />}>
                          <Collaboration />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/whiteboard/:roomId" element={
                      <ProtectedRoute requiredRole="student">
                        <Suspense fallback={<RouteLoader />}>
                          <Whiteboard />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/video-conference/:meetingId" element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <VideoConference />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/ai-tutor" element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <AITutor />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/exam-proctoring/:examId" element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ExamProctoring />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/learning-paths" element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <LearningPaths />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/real-time-courses" element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <RealTimeCourses />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/my-learning" element={
                      <ProtectedRoute requiredRole="student">
                        <Suspense fallback={<RouteLoader />}>
                          <MyLearning />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/student-auth" element={
                      <Suspense fallback={<RouteLoader />}>
                        <StudentAuth />
                      </Suspense>
                    } />
                    <Route path="/lecturer-auth" element={
                      <Suspense fallback={<RouteLoader />}>
                        <LecturerAuth />
                      </Suspense>
                    } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={
                      <Suspense fallback={<RouteLoader />}>
                        <NotFound />
                      </Suspense>
                    } />
                  </Routes>
                </AuthProvider>
              </PerformanceMonitor>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
