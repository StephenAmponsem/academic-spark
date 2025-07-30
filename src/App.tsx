import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import FloatingQAButton from "./components/FloatingQAButton";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Collaboration from "./pages/Collaboration";

import StudentAuth from "./pages/StudentAuth";
import LecturerAuth from "./pages/LecturerAuth";
import AIQA from "./pages/AIQA";
import { RealTimeCourses } from "./components/RealTimeCourses";
import MyLearning from "./pages/MyLearning";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
               <Route path="/settings" element={<Settings />} />
               <Route path="/collaboration" element={<Collaboration />} />
               
                               <Route path="/ai-qa" element={<AIQA />} />
                <Route path="/real-time-courses" element={<RealTimeCourses />} />
                <Route path="/my-learning" element={<MyLearning />} />
                <Route path="/student-auth" element={<StudentAuth />} />
                <Route path="/lecturer-auth" element={<LecturerAuth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingQAButton />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
