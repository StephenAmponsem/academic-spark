import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, MessageCircle, Users, BookOpen, Lightbulb, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Assistance",
    description: "Get instant, intelligent answers to your academic questions with our advanced AI system."
  },
  {
    icon: MessageCircle,
    title: "Real-time Q&A",
    description: "Connect with instructors and peers for immediate help and collaborative problem-solving."
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Join study groups, share resources, and learn together in a supportive environment."
  },
  {
    icon: BookOpen,
    title: "Smart Content Library",
    description: "Access curated academic resources tailored to your courses and learning goals."
  },
  {
    icon: Lightbulb,
    title: "Personalized Insights",
    description: "Receive AI-generated insights and recommendations based on your learning patterns."
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get immediate feedback on assignments and progress from both AI and instructors."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground animate-fade-in">
            Powerful Features for
            <span className="block text-primary">Modern Learning</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up [animation-delay:200ms]">
            Discover how EDUConnect transforms traditional academic communication 
            with cutting-edge AI technology and collaborative tools.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-hover transition-all duration-500 hover:-translate-y-2 border-0 shadow-card animate-fade-in-up hover:bg-gradient-to-br hover:from-background hover:to-muted/30"
              style={{ animationDelay: `${index * 100 + 400}ms` }}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <feature.icon className="w-8 h-8 text-white relative z-10" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;