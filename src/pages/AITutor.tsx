import Header from '@/components/Header';
import { PersonalizedAITutor } from '@/components/ai-tutor/PersonalizedAITutor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Clock, 
  Users,
  Award,
  BookOpen,
  MessageSquare,
  Zap,
  Settings,
  HelpCircle
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';

export default function AITutor() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Tutor</h1>
              <p className="text-gray-600">
                Your personalized learning companion powered by advanced AI
              </p>
            </div>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900">Adaptive Learning</h3>
                <p className="text-sm text-blue-700">Adjusts to your pace and style</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-900">Personalized Goals</h3>
                <p className="text-sm text-purple-700">Custom learning objectives</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">Progress Tracking</h3>
                <p className="text-sm text-green-700">Real-time learning analytics</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-900">24/7 Available</h3>
                <p className="text-sm text-orange-700">Learn anytime, anywhere</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Your AI Learning Stats</h3>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>142 conversations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>23 concepts mastered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>87% accuracy rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>15% faster learning</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Tutor Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    How it Works
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Tutor Interface */}
        <PersonalizedAITutor />

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              How Your AI Tutor Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold mb-2">Analyzes Your Learning</h4>
                <p className="text-sm text-gray-600">
                  The AI continuously analyzes your learning patterns, strengths, and areas for improvement to provide personalized guidance.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">2</span>
                </div>
                <h4 className="font-semibold mb-2">Adapts Teaching Style</h4>
                <p className="text-sm text-gray-600">
                  Based on your preferences and learning style, the tutor adapts its explanations, examples, and teaching methods.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600">3</span>
                </div>
                <h4 className="font-semibold mb-2">Provides Insights</h4>
                <p className="text-sm text-gray-600">
                  Get detailed insights about your progress, learning efficiency, and personalized recommendations for improvement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}