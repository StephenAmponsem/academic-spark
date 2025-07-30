import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-education.jpg";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Students collaborating with AI" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in">
            Revolutionize
            <span className="block bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent animate-glow">
              Academic Learning
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            Connect students and instructors with AI-powered collaboration. 
            Ask questions, get instant answers, and enhance your academic journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in [animation-delay:400ms]">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6 hover:scale-105 transition-transform duration-300"
              onClick={() => navigate(user ? '/real-time-courses' : '/auth')}
            >
              {user ? 'Browse Courses' : 'Start Learning Today'}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              onClick={() => navigate(user ? '/dashboard' : '/real-time-courses')}
            >
              {user ? 'My Dashboard' : 'Explore Courses'}
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-white/80 animate-fade-in-up [animation-delay:600ms]">
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-glow group-hover:scale-125 transition-transform duration-300"></div>
              <span className="group-hover:text-white transition-colors duration-300">AI-Powered Support</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-glow [animation-delay:1s] group-hover:scale-125 transition-transform duration-300"></div>
              <span className="group-hover:text-white transition-colors duration-300">Real-time Collaboration</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-glow [animation-delay:2s] group-hover:scale-125 transition-transform duration-300"></div>
              <span className="group-hover:text-white transition-colors duration-300">Smart Recommendations</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
    </section>
  );
};

export default HeroSection;