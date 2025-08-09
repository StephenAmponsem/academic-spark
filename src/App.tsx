import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import useAuth from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Collaboration from "./pages/Collaboration";

import StudentAuth from "./pages/StudentAuth";
import LecturerAuth from "./pages/LecturerAuth";
import AITutor from "./pages/AITutor";
import Search from "./pages/Search";
import Forums from "./pages/Forums";
import VideoConference from "./pages/VideoConference";
import ExamProctoring from "./pages/ExamProctoring";
import LearningPaths from "./pages/LearningPaths";
import Whiteboard from "./pages/Whiteboard";
import { RealTimeCourses } from "./components/RealTimeCourses";
import MyLearning from "./pages/MyLearning";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ProtectedRoute component for RBAC
function ProtectedRoute({ children, requiredRole }: { children: JSX.Element, requiredRole?: string }) {
  const { role, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
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
    return (
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
    );
  }
  
  return children;
}

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
              <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                } />
                <Route path="/forums" element={
                  <ProtectedRoute>
                    <Forums />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={<Settings />} />
                <Route path="/collaboration" element={
                  <ProtectedRoute requiredRole="student">
                    <Collaboration />
                  </ProtectedRoute>
                } />
                <Route path="/whiteboard/:roomId" element={
                  <ProtectedRoute requiredRole="student">
                    <Whiteboard />
                  </ProtectedRoute>
                } />
                <Route path="/video-conference/:meetingId" element={
                  <ProtectedRoute>
                    <VideoConference />
                  </ProtectedRoute>
                } />

                <Route path="/ai-tutor" element={
                  <ProtectedRoute>
                    <AITutor />
                  </ProtectedRoute>
                } />
                <Route path="/exam-proctoring/:examId" element={
                  <ProtectedRoute>
                    <ExamProctoring />
                  </ProtectedRoute>
                } />
                <Route path="/learning-paths" element={
                  <ProtectedRoute>
                    <LearningPaths />
                  </ProtectedRoute>
                } />
                <Route path="/real-time-courses" element={
                  <ProtectedRoute>
                    <RealTimeCourses />
                  </ProtectedRoute>
                } />
                <Route path="/my-learning" element={
                  <ProtectedRoute requiredRole="student">
                    <MyLearning />
                  </ProtectedRoute>
                } />
                <Route path="/student-auth" element={<StudentAuth />} />
                <Route path="/lecturer-auth" element={<LecturerAuth />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
