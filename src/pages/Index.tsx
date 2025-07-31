import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [forceRender, setForceRender] = useState(false);

  console.log('Index component rendering:', { user: user?.id || 'null', loading });

  // Force render after 2 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Index: Force rendering after timeout');
      setForceRender(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking authentication, but with a fallback
  if (loading && !forceRender) {
    console.log('Index: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Index: Rendering main content');
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
