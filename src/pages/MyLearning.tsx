import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  TrendingUp, 
  MessageCircle, 
  Video, 
  Headphones,
  PenTool,
  Code,
  Calculator,
  Globe,
  Microscope,
  Palette,
  Music,
  Camera,
  Gamepad2,
  Dumbbell,
  Heart,
  Leaf,
  Car,
  Plane,
  Ship,
  Train,
  Bus,
  Bike,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Database,
  Cloud,
  Wifi,
  Bluetooth,
  Usb,
  Antenna,
  Satellite,
  Radar,
  Sparkles,
  ArrowLeft,
  Plus
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function MyLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl">
                <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Welcome to My Learning</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign in to access your personalized learning dashboard and track your course progress.
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your learning journey...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm"
              >
                <BookOpen className="h-4 w-4" />
                Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Learning Active</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                  <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Learning Journey
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your progress and continue your educational adventure
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Enrolled Courses</p>
                  <p className="text-3xl font-bold">∞</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Learning Hours</p>
                  <p className="text-3xl font-bold">∞</p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Certificates</p>
                  <p className="text-3xl font-bold">∞</p>
                </div>
                <Star className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Achievements</p>
                  <p className="text-3xl font-bold">∞</p>
                </div>
                <Users className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <Card className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg">
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Start Your Learning Journey</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Discover amazing courses and begin your educational adventure today! 
            Our learning platform is ready to help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/real-time-courses')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/ai-qa')} 
              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Learning Assistant
            </Button>
          </div>
        </Card>

        {/* Learning Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Set Learning Goals</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Define clear objectives</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Establish specific, measurable learning goals to track your progress and stay motivated throughout your educational journey.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Consistent Practice</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Daily learning routine</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Dedicate regular time to your studies. Even 30 minutes a day can make a significant difference in your learning progress.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Collaborate & Share</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learn with others</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Connect with fellow learners, join study groups, and share your knowledge. Collaboration enhances the learning experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 