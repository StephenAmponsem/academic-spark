import { useState } from 'react';
import Header from '@/components/Header';
import { ProgressDashboard } from '@/components/analytics/ProgressDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp,
  Download,
  Calendar,
  Clock,
  Target,
  Award
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';

export default function Analytics() {
  const { user, role } = useAuth();
  const [activeView, setActiveView] = useState<'personal' | 'instructor'>('personal');

  // Instructor analytics data (mock)
  const instructorStats = {
    totalStudents: 1247,
    activeCourses: 8,
    completionRate: 78,
    averageRating: 4.7,
    totalRevenue: 15420,
    monthlyGrowth: 12.5
  };

  const InstructorDashboard = () => (
    <div className="space-y-6">
      {/* Instructor Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{instructorStats.totalStudents.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Students</div>
            <div className="text-xs text-green-600 mt-1">
              +{instructorStats.monthlyGrowth}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{instructorStats.activeCourses}</div>
            <div className="text-sm text-gray-600">Active Courses</div>
            <div className="text-xs text-blue-600 mt-1">
              2 new this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{instructorStats.completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="text-xs text-green-600 mt-1">
              Above average
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{instructorStats.averageRating}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="text-xs text-yellow-600 mt-1">
              Based on 450 reviews
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Course Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'React Advanced Patterns', students: 234, completion: 82, rating: 4.8 },
              { name: 'JavaScript Fundamentals', students: 567, completion: 75, rating: 4.6 },
              { name: 'Node.js Backend Development', students: 189, completion: 68, rating: 4.7 },
              { name: 'TypeScript Mastery', students: 145, completion: 91, rating: 4.9 }
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{course.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{course.students} students</span>
                    <span>•</span>
                    <span>{course.completion}% completion</span>
                    <span>•</span>
                    <span>⭐ {course.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={course.completion > 80 ? "default" : "secondary"}>
                    {course.completion > 80 ? "Excellent" : "Good"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
            <p className="text-gray-600 mt-1">
              {role === 'instructor' 
                ? 'Monitor your courses and student progress' 
                : 'Track your learning journey and achievements'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'instructor' && (
              <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
                <TabsList>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Analytics Content */}
        {role === 'instructor' && activeView === 'instructor' ? (
          <InstructorDashboard />
        ) : (
          <ProgressDashboard />
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Schedule Study Session</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Target className="h-5 w-5" />
                <span className="text-sm">Set Learning Goal</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Browse Courses</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Award className="h-5 w-5" />
                <span className="text-sm">View Achievements</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}