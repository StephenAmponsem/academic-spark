import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <Card className="bg-gradient-hero border-0 shadow-hover overflow-hidden relative animate-scale-in">
          <div className="absolute inset-0 bg-gradient-glow opacity-30"></div>
          <div className="absolute inset-0 bg-white/10 opacity-20"></div>
          
          <CardContent className="relative z-10 text-center py-16 px-8">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              Ready to Transform Your
              <span className="block animate-glow">Academic Journey?</span>
            </h3>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
              Join thousands of students and educators already using EDUConnect 
              to enhance their learning experience with AI-powered collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-scale-in [animation-delay:400ms]">
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300"
                onClick={() => navigate(user ? '/real-time-courses' : '/auth')}
              >
                {user ? 'Browse Courses' : 'Get Started Free'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                onClick={() => navigate(user ? '/dashboard' : '/real-time-courses')}
              >
                {user ? 'My Dashboard' : 'Explore Courses'}
              </Button>
            </div>
            
            <div className="text-sm text-white/70">
              ✓ Free to start • ✓ No credit card required • ✓ Full AI access
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;