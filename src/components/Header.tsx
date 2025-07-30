import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, User, MessageCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "./NotificationCenter";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border animate-fade-in">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">EDUConnect</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={() => navigate('/courses')} className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
            Courses
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
          </button>
          {user && (
            <>
              <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                Dashboard
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
              </button>
                        <button onClick={() => navigate('/messaging')} className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
            Messages
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
          </button>
          <button onClick={() => navigate('/ai-qa')} className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
            AI Q&A
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
          </button>
              <button onClick={() => navigate('/qa')} className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                Q&A Chat
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
              </button>
            </>
          )}
          <a href="#features" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
            About
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
          </a>
        </nav>
        
        <div className="flex items-center space-x-3">
          {user && <NotificationCenter />}
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
        </div>
      </div>
    </header>
  );
};

export default Header;