import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Route, 
  Target, 
  Brain, 
  Zap, 
  Clock, 
  Star, 
  BookOpen, 
  Video, 
  FileText, 
  Trophy,
  MapPin,
  TrendingUp,
  Users,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowDown,
  Lightbulb,
  Rocket,
  Flag,
  Calendar,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Share2,
  Download,
  Edit3,
  Trash2,
  Plus,
  Minus,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  Award,
  Flame,
  Eye,
  Heart,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Code,
  Palette,
  Calculator,
  Languages,
  Briefcase,
  GraduationCap,
  Building,
  Cpu,
  Database,
  Cloud,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface LearningNode {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'lesson' | 'project' | 'assessment' | 'milestone' | 'skill_check';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // hours
  prerequisites: string[];
  learningOutcomes: string[];
  resources: Resource[];
  isCompleted: boolean;
  isUnlocked: boolean;
  progress: number;
  competencyLevel: number; // 0-100
  adaptiveWeight: number; // AI-calculated importance
  position: { x: number; y: number };
}

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'exercise' | 'quiz' | 'document' | 'interactive';
  url: string;
  duration: number;
  difficulty: string;
  rating: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  totalDuration: number; // hours
  difficulty: string;
  nodes: LearningNode[];
  connections: PathConnection[];
  completionRate: number;
  estimatedCompletion: Date;
  adaptiveFactors: AdaptiveFactors;
  createdAt: Date;
  updatedAt: Date;
}

interface PathConnection {
  from: string;
  to: string;
  type: 'sequential' | 'optional' | 'prerequisite' | 'alternative';
  strength: number; // 0-1
}

interface AdaptiveFactors {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'accelerated' | 'standard' | 'extended';
  availableTime: number; // hours per week
  careerGoals: string[];
  currentSkillLevel: Record<string, number>;
  weaknessAreas: string[];
  interestAreas: string[];
  preferredContentTypes: string[];
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetSkillLevel: number;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  subGoals: string[];
}

interface DynamicLearningPathGeneratorProps {
  userId?: string;
  initialGoal?: string;
  className?: string;
}

export function DynamicLearningPathGenerator({ userId, initialGoal, className }: DynamicLearningPathGeneratorProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'generator' | 'paths' | 'progress' | 'analytics'>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [generatedPaths, setGeneratedPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [currentGoal, setCurrentGoal] = useState(initialGoal || '');
  const [careerTarget, setCareerTarget] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('10');
  const [preferredPace, setPreferredPace] = useState<'accelerated' | 'standard' | 'extended'>('standard');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Mock adaptive factors
  const adaptiveFactors: AdaptiveFactors = {
    learningStyle: 'visual',
    pace: preferredPace,
    availableTime: parseInt(timeCommitment),
    careerGoals: ['Frontend Developer', 'Full Stack Developer'],
    currentSkillLevel: {
      'JavaScript': 75,
      'React': 65,
      'TypeScript': 45,
      'Node.js': 30,
      'CSS': 80,
      'HTML': 90,
      'Git': 60,
      'Testing': 25
    },
    weaknessAreas: ['Backend Development', 'Testing', 'DevOps'],
    interestAreas: ['Web Development', 'Mobile Development', 'UI/UX'],
    preferredContentTypes: ['video', 'interactive', 'project']
  };

  // Mock learning nodes
  const mockNodes: LearningNode[] = [
    {
      id: 'node-1',
      title: 'Advanced React Patterns',
      description: 'Master complex React patterns including render props, HOCs, and compound components',
      type: 'course',
      category: 'React',
      difficulty: 'advanced',
      estimatedTime: 20,
      prerequisites: ['react-basics', 'javascript-advanced'],
      learningOutcomes: ['Advanced component patterns', 'Performance optimization', 'Code reusability'],
      resources: [
        {
          id: 'r1',
          title: 'React Patterns Tutorial',
          type: 'video',
          url: '/courses/react-patterns',
          duration: 120,
          difficulty: 'advanced',
          rating: 4.8
        }
      ],
      isCompleted: false,
      isUnlocked: true,
      progress: 0,
      competencyLevel: 0,
      adaptiveWeight: 0.9,
      position: { x: 100, y: 100 }
    },
    {
      id: 'node-2',
      title: 'TypeScript Integration',
      description: 'Learn to integrate TypeScript with React for type-safe development',
      type: 'course',
      category: 'TypeScript',
      difficulty: 'intermediate',
      estimatedTime: 15,
      prerequisites: ['javascript-basics'],
      learningOutcomes: ['Type safety', 'Better IDE support', 'Reduced runtime errors'],
      resources: [
        {
          id: 'r2',
          title: 'TypeScript for React',
          type: 'video',
          url: '/courses/typescript-react',
          duration: 90,
          difficulty: 'intermediate',
          rating: 4.7
        }
      ],
      isCompleted: false,
      isUnlocked: true,
      progress: 0,
      competencyLevel: 0,
      adaptiveWeight: 0.8,
      position: { x: 300, y: 150 }
    },
    {
      id: 'node-3',
      title: 'React Testing Strategies',
      description: 'Comprehensive testing approach for React applications',
      type: 'course',
      category: 'Testing',
      difficulty: 'intermediate',
      estimatedTime: 12,
      prerequisites: ['react-basics'],
      learningOutcomes: ['Unit testing', 'Integration testing', 'Test-driven development'],
      resources: [
        {
          id: 'r3',
          title: 'React Testing Library Guide',
          type: 'interactive',
          url: '/courses/react-testing',
          duration: 75,
          difficulty: 'intermediate',
          rating: 4.6
        }
      ],
      isCompleted: false,
      isUnlocked: false,
      progress: 0,
      competencyLevel: 0,
      adaptiveWeight: 0.7,
      position: { x: 500, y: 200 }
    },
    {
      id: 'node-4',
      title: 'Portfolio Project',
      description: 'Build a complete portfolio website showcasing your skills',
      type: 'project',
      category: 'Project',
      difficulty: 'advanced',
      estimatedTime: 25,
      prerequisites: ['node-1', 'node-2'],
      learningOutcomes: ['Real-world application', 'Portfolio piece', 'Integration skills'],
      resources: [
        {
          id: 'r4',
          title: 'Portfolio Project Guide',
          type: 'document',
          url: '/projects/portfolio',
          duration: 180,
          difficulty: 'advanced',
          rating: 4.9
        }
      ],
      isCompleted: false,
      isUnlocked: false,
      progress: 0,
      competencyLevel: 0,
      adaptiveWeight: 0.95,
      position: { x: 200, y: 300 }
    }
  ];

  // Generate learning path based on goals and adaptive factors
  const generateLearningPath = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newPath: LearningPath = {
      id: `path-${Date.now()}`,
      title: `${currentGoal} Learning Path`,
      description: `Personalized path to achieve ${currentGoal} based on your current skills and goals`,
      category: selectedCategory || 'Web Development',
      totalDuration: mockNodes.reduce((sum, node) => sum + node.estimatedTime, 0),
      difficulty: 'intermediate',
      nodes: mockNodes,
      connections: [
        { from: 'node-1', to: 'node-2', type: 'sequential', strength: 0.8 },
        { from: 'node-2', to: 'node-3', type: 'optional', strength: 0.6 },
        { from: 'node-1', to: 'node-4', type: 'prerequisite', strength: 0.9 },
        { from: 'node-2', to: 'node-4', type: 'prerequisite', strength: 0.7 }
      ],
      completionRate: 0,
      estimatedCompletion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      adaptiveFactors,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setGeneratedPaths(prev => [newPath, ...prev]);
    setSelectedPath(newPath);
    setIsGenerating(false);
    setActiveTab('paths');
  };

  // Career goal options
  const careerGoals = [
    { value: 'frontend', label: 'Frontend Developer', icon: Code },
    { value: 'fullstack', label: 'Full Stack Developer', icon: Database },
    { value: 'mobile', label: 'Mobile Developer', icon: Smartphone },
    { value: 'devops', label: 'DevOps Engineer', icon: Cloud },
    { value: 'data', label: 'Data Scientist', icon: BarChart3 },
    { value: 'ui-ux', label: 'UI/UX Designer', icon: Palette },
    { value: 'product', label: 'Product Manager', icon: Briefcase },
    { value: 'architect', label: 'Software Architect', icon: Building }
  ];

  // Learning categories
  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cybersecurity',
    'Game Development',
    'Blockchain'
  ];

  const getNodeIcon = (type: string) => {
    const iconMap = {
      'course': BookOpen,
      'lesson': Play,
      'project': Rocket,
      'assessment': Trophy,
      'milestone': Flag,
      'skill_check': Target
    };
    return iconMap[type as keyof typeof iconMap] || BookOpen;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const PathVisualization = ({ path }: { path: LearningPath }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Learning Path Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-96 bg-gray-50 rounded-lg p-6 overflow-auto">
          {/* Nodes */}
          {path.nodes.map((node, index) => {
            const NodeIcon = getNodeIcon(node.type);
            return (
              <div
                key={node.id}
                className={cn(
                  "absolute w-48 p-3 bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer",
                  node.isCompleted ? "border-green-300 bg-green-50" :
                  node.isUnlocked ? "border-blue-300 bg-blue-50" : "border-gray-300 bg-gray-50"
                )}
                style={{
                  left: `${50 + index * 200}px`,
                  top: `${100 + (index % 2) * 150}px`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <NodeIcon className="h-4 w-4" />
                  <span className="font-medium text-sm truncate">{node.title}</span>
                  {node.isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                
                <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {node.description}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={cn("text-xs border", getDifficultyColor(node.difficulty))}>
                    {node.difficulty}
                  </Badge>
                  <span className="text-xs text-gray-500">{node.estimatedTime}h</span>
                </div>
                
                {node.progress > 0 && (
                  <Progress value={node.progress} className="h-1 mt-2" />
                )}
              </div>
            );
          })}

          {/* Connections */}
          <svg className="absolute inset-0 pointer-events-none">
            {path.connections.map((connection, index) => {
              const fromNode = path.nodes.find(n => n.id === connection.from);
              const toNode = path.nodes.find(n => n.id === connection.to);
              if (!fromNode || !toNode) return null;

              const fromIndex = path.nodes.indexOf(fromNode);
              const toIndex = path.nodes.indexOf(toNode);
              
              const x1 = 50 + fromIndex * 200 + 96; // Center of from node
              const y1 = 100 + (fromIndex % 2) * 150 + 40;
              const x2 = 50 + toIndex * 200 + 96; // Center of to node
              const y2 = 100 + (toIndex % 2) * 150 + 40;

              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={connection.type === 'prerequisite' ? '#ef4444' : '#3b82f6'}
                  strokeWidth={2}
                  strokeDasharray={connection.type === 'optional' ? '5,5' : '0'}
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            
            {/* Arrow marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#3b82f6"
                />
              </marker>
            </defs>
          </svg>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dynamic Learning Path Generator</h1>
              <p className="text-gray-600">AI-powered personalized curriculum creation based on your goals and learning style</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-purple-100 text-purple-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge className="bg-pink-100 text-pink-800">
                  <Target className="h-3 w-3 mr-1" />
                  Goal-Oriented
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Adaptive
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Path Generator</TabsTrigger>
          <TabsTrigger value="paths">My Paths ({generatedPaths.length})</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Path Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Create Your Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Learning Goal */}
              <div className="space-y-2">
                <label className="text-sm font-medium">What do you want to learn?</label>
                <Textarea
                  placeholder="Describe your learning goal (e.g., 'Become a full-stack React developer', 'Learn machine learning for data analysis')"
                  value={currentGoal}
                  onChange={(e) => setCurrentGoal(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Career Target */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Career Target</label>
                <Select value={careerTarget} onValueChange={setCareerTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your career goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {careerGoals.map((goal) => {
                      const IconComponent = goal.icon;
                      return (
                        <SelectItem key={goal.value} value={goal.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {goal.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Category and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Commitment (hours/week)</label>
                  <Input
                    type="number"
                    value={timeCommitment}
                    onChange={(e) => setTimeCommitment(e.target.value)}
                    min="1"
                    max="40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Pace</label>
                  <Select value={preferredPace} onValueChange={(value: any) => setPreferredPace(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accelerated">Accelerated</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="extended">Extended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Current Skills Overview */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Current Skill Levels</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(adaptiveFactors.currentSkillLevel).map(([skill, level]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{skill}</span>
                        <span className="text-gray-600">{level}%</span>
                      </div>
                      <Progress value={level} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateLearningPath} 
                disabled={!currentGoal.trim() || isGenerating}
                className="w-full h-12"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Your Personalized Path...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Learning Path
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900">AI-Powered</h3>
                <p className="text-sm text-blue-700">Advanced algorithms analyze your profile</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">Goal-Oriented</h3>
                <p className="text-sm text-green-700">Paths designed to achieve your specific goals</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-900">Adaptive</h3>
                <p className="text-sm text-purple-700">Continuously adjusts based on progress</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Paths Tab */}
        <TabsContent value="paths" className="space-y-6">
          {generatedPaths.length > 0 ? (
            <div className="space-y-6">
              {/* Path Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedPaths.map((path) => (
                  <Card 
                    key={path.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedPath?.id === path.id && "ring-2 ring-blue-500 bg-blue-50"
                    )}
                    onClick={() => setSelectedPath(path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Route className="h-4 w-4 text-blue-500" />
                        <h3 className="font-semibold truncate">{path.title}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {path.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{Math.round(path.completionRate)}%</span>
                        </div>
                        <Progress value={path.completionRate} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>{path.totalDuration}h total</span>
                        <span>{path.nodes.length} modules</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Path Details */}
              {selectedPath && (
                <>
                  <PathVisualization path={selectedPath} />
                  
                  {/* Path Modules */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedPath.nodes.map((node, index) => {
                          const NodeIcon = getNodeIcon(node.type);
                          return (
                            <div key={node.id} className="flex items-start gap-4 p-4 border rounded-lg">
                              <div className="flex-shrink-0">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                  node.isCompleted ? "bg-green-100 text-green-600" :
                                  node.isUnlocked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                                )}>
                                  {node.isCompleted ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : (
                                    <NodeIcon className="h-5 w-5" />
                                  )}
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{node.title}</h4>
                                  <Badge className={cn("text-xs border", getDifficultyColor(node.difficulty))}>
                                    {node.difficulty}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {node.estimatedTime}h
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">{node.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {node.learningOutcomes.slice(0, 3).map((outcome, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {outcome}
                                    </Badge>
                                  ))}
                                </div>

                                {node.progress > 0 && (
                                  <div className="mb-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Progress</span>
                                      <span>{node.progress}%</span>
                                    </div>
                                    <Progress value={node.progress} className="h-2" />
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <Button size="sm" disabled={!node.isUnlocked}>
                                    {node.isCompleted ? 'Review' : node.progress > 0 ? 'Continue' : 'Start'}
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Preview
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Learning Paths Yet</h3>
                <p className="text-gray-600 mb-4">
                  Generate your first personalized learning path using the Path Generator.
                </p>
                <Button onClick={() => setActiveTab('generator')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Learning Path
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-sm text-gray-600">Active Paths</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Completed Modules</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">47h</div>
                <div className="text-sm text-gray-600">Time Invested</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">78%</div>
                <div className="text-sm text-gray-600">Avg Completion</div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(adaptiveFactors.currentSkillLevel).map(([skill, level]) => (
                  <div key={skill}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{level}%</span>
                        <Badge className="text-xs bg-green-100 text-green-800">
                          +{Math.floor(Math.random() * 15) + 5}% this month
                        </Badge>
                      </div>
                    </div>
                    <Progress value={level} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Detailed learning analytics would be displayed here</p>
                <p className="text-sm">Including completion trends, time spent, and difficulty progression</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DynamicLearningPathGenerator;