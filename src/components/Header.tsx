import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, User, MessageCircle, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingElement } from "@/components/ui/page-transition";

const Header = () => {
  const { user, signOut, role, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Navigate immediately for better UX
    navigate('/');
    
    // Then handle the actual sign out
    await signOut();
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border shadow-lg"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-2 group cursor-pointer" 
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FloatingElement amplitude={3} frequency={4}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <motion.span 
                className="text-white font-bold text-lg relative z-10"
                animate={{ 
                  textShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 8px rgba(255,255,255,0.8)", "0 0 0px rgba(255,255,255,0)"] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                E
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                animate={{ x: [-20, 40] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </FloatingElement>
          <motion.span 
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            whileHover={{ 
              backgroundImage: "linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)",
              transition: { duration: 0.3 }
            }}
          >
            EDUConnect
          </motion.span>
        </motion.div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <motion.button 
            onClick={() => navigate('/real-time-courses')} 
            className="text-muted-foreground hover:text-primary transition-all duration-300 relative group px-2 py-1"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            Courses
            <motion.div 
              className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          {user && (
            <>
              <motion.button 
                onClick={() => navigate('/dashboard')} 
                className="text-muted-foreground hover:text-primary transition-all duration-300 relative group px-2 py-1"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
                <motion.div 
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              <motion.button 
                onClick={() => navigate('/analytics')} 
                className="text-muted-foreground hover:text-primary transition-all duration-300 relative group px-2 py-1"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Analytics
                <motion.div 
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              <motion.button 
                onClick={() => navigate('/search')} 
                className="text-muted-foreground hover:text-primary transition-all duration-300 relative group px-2 py-1"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Search
                <motion.div 
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              <motion.button 
                onClick={() => navigate('/forums')} 
                className="text-muted-foreground hover:text-primary transition-all duration-300 relative group px-2 py-1"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Forums
                <motion.div 
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              <motion.button 
                onClick={() => navigate('/ai-tutor')} 
                className="text-muted-foreground hover:text-primary transition-all duration-300 relative group px-2 py-1"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                AI Tutor
                <motion.div 
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
             </>
           )}
          <a href="#features" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
            About
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
          </a>
        </nav>
        
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}>
            <ThemeToggle />
          </motion.div>
          {user && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NotificationCenter />
            </motion.div>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.user_metadata?.full_name || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="hidden sm:inline-flex hover:scale-105 transition-transform duration-300"
                  >
                    Sign In
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/student-auth')}>
                    <User className="mr-2 h-4 w-4" />
                    Student Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/lecturer-auth')}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Lecturer Sign In
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="hero" 
                    className="hover:scale-105 transition-transform duration-300"
                  >
                    Get Started
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/student-auth')}>
                    <User className="mr-2 h-4 w-4" />
                    Join as Student
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/lecturer-auth')}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Join as Lecturer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;