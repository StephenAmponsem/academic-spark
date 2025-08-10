import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { motion } from "framer-motion";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  // Show content immediately, don't wait for auth
  useEffect(() => {
    // Show content immediately for better performance
    setShowContent(true);
  }, []);

  // Only show loading for a very short time on initial page load
  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner size="lg" variant="gradient" />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </motion.div>
  );
};

export default Index;
