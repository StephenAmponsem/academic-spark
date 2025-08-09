import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Flame, 
  Crown, 
  Award, 
  Medal,
  Heart,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Gift,
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle,
  BarChart3,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'social' | 'milestone' | 'special' | 'streak';
  icon: string;
  color: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  requirements: string[];
}

interface UserStats {
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  totalAchievements: number;
  unlockedAchievements: number;
  currentStreak: number;
  longestStreak: number;
  hoursStudied: number;
  coursesCompleted: number;
  rank: number;
  totalUsers: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'badge' | 'theme' | 'feature' | 'certificate';
  icon: string;
  isUnlocked: boolean;
  isPurchased: boolean;
}

export function AchievementSystem() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'achievements' | 'progress' | 'rewards' | 'leaderboard'>('achievements');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Mock user stats
  const userStats: UserStats = {
    totalPoints: 2450,
    level: 12,
    pointsToNextLevel: 550,
    totalAchievements: 45,
    unlockedAchievements: 28,
    currentStreak: 7,
    longestStreak: 15,
    hoursStudied: 124,
    coursesCompleted: 8,
    rank: 23,
    totalUsers: 1247
  };

  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      category: 'learning',
      icon: 'footprints',
      color: 'blue',
      points: 50,
      rarity: 'common',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      progress: 1,
      maxProgress: 1,
      requirements: ['Complete 1 lesson']
    },
    {
      id: '2',
      title: 'Speed Learner',
      description: 'Complete 5 lessons in one day',
      category: 'learning',
      icon: 'zap',
      color: 'yellow',
      points: 200,
      rarity: 'rare',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      progress: 5,
      maxProgress: 5,
      requirements: ['Complete 5 lessons in a single day']
    },
    {
      id: '3',
      title: 'Social Butterfly',
      description: 'Join 3 study groups',
      category: 'social',
      icon: 'users',
      color: 'green',
      points: 150,
      rarity: 'common',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      progress: 3,
      maxProgress: 3,
      requirements: ['Join 3 different study groups']
    },
    {
      id: '4',
      title: 'Fire Streak',
      description: 'Study for 10 consecutive days',
      category: 'streak',
      icon: 'flame',
      color: 'orange',
      points: 300,
      rarity: 'epic',
      isUnlocked: false,
      progress: 7,
      maxProgress: 10,
      requirements: ['Study for 10 consecutive days']
    },
    {
      id: '5',
      title: 'Course Conqueror',
      description: 'Complete 10 courses',
      category: 'milestone',
      icon: 'crown',
      color: 'purple',
      points: 1000,
      rarity: 'legendary',
      isUnlocked: false,
      progress: 8,
      maxProgress: 10,
      requirements: ['Complete 10 courses with at least 80% score']
    },
    {
      id: '6',
      title: 'Night Owl',
      description: 'Study after 10 PM for 5 days',
      category: 'special',
      icon: 'moon',
      color: 'indigo',
      points: 100,
      rarity: 'rare',
      isUnlocked: false,
      progress: 2,
      maxProgress: 5,
      requirements: ['Study after 10 PM for 5 different days']
    }
  ];

  // Mock rewards
  const rewards: Reward[] = [
    {
      id: '1',
      title: 'Golden Badge',
      description: 'Show off your achievements with a golden profile badge',
      cost: 500,
      type: 'badge',
      icon: 'medal',
      isUnlocked: true,
      isPurchased: false
    },
    {
      id: '2',
      title: 'Dark Theme',
      description: 'Unlock the premium dark theme',
      cost: 300,
      type: 'theme',
      icon: 'palette',
      isUnlocked: true,
      isPurchased: true
    },
    {
      id: '3',
      title: 'Course Certificate',
      description: 'Get a premium certificate for course completion',
      cost: 200,
      type: 'certificate',
      icon: 'award',
      isUnlocked: true,
      isPurchased: false
    },
    {
      id: '4',
      title: 'Priority Support',
      description: 'Get priority customer support',
      cost: 1000,
      type: 'feature',
      icon: 'headphones',
      isUnlocked: false,
      isPurchased: false
    }
  ];

  // Mock leaderboard
  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', points: 8450, level: 25, streak: 45 },
    { rank: 2, name: 'Alex Rodriguez', points: 7890, level: 23, streak: 32 },
    { rank: 3, name: 'Emma Thompson', points: 7234, level: 22, streak: 28 },
    { rank: 23, name: 'You', points: userStats.totalPoints, level: userStats.level, streak: userStats.currentStreak },
    { rank: 24, name: 'Mike Johnson', points: 2398, level: 11, streak: 12 },
    { rank: 25, name: 'Lisa Wang', points: 2156, level: 10, streak: 8 }
  ];

  const getAchievementIcon = (icon: string) => {
    const iconMap = {
      footprints: BookOpen,
      zap: Zap,
      users: Users,
      flame: Flame,
      crown: Crown,
      moon: Clock,
      trophy: Trophy,
      star: Star,
      medal: Medal,
      award: Award,
      target: Target,
      heart: Heart
    };
    return iconMap[icon as keyof typeof iconMap] || Trophy;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPointsColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const purchaseReward = (reward: Reward) => {
    if (userStats.totalPoints >= reward.cost) {
      toast.success(`${reward.title} purchased!`);
    } else {
      toast.error('Not enough points to purchase this reward');
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    categoryFilter === 'all' || achievement.category === categoryFilter
  );

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const IconComponent = getAchievementIcon(achievement.icon);
    
    return (
      <Card className={cn(
        "transition-all duration-300 hover:shadow-lg",
        achievement.isUnlocked ? "border-green-200 bg-green-50/50" : "border-gray-200"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
              achievement.isUnlocked 
                ? `bg-${achievement.color}-500 text-white`
                : "bg-gray-200 text-gray-400"
            )}>
              {achievement.isUnlocked ? (
                <IconComponent className="h-6 w-6" />
              ) : (
                <Lock className="h-6 w-6" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  "font-medium truncate",
                  achievement.isUnlocked ? "text-gray-900" : "text-gray-500"
                )}>
                  {achievement.title}
                </h4>
                {achievement.isUnlocked && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              <p className={cn(
                "text-sm mb-3",
                achievement.isUnlocked ? "text-gray-600" : "text-gray-400"
              )}>
                {achievement.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs border", getRarityColor(achievement.rarity))}>
                    {achievement.rarity}
                  </Badge>
                  <span className={cn("text-sm font-medium", getPointsColor(achievement.rarity))}>
                    +{achievement.points} pts
                  </span>
                </div>
                
                {achievement.isUnlocked && achievement.unlockedAt && (
                  <span className="text-xs text-gray-500">
                    {achievement.unlockedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {!achievement.isUnlocked && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Points</div>
            <div className="text-xs text-blue-600 mt-1">
              Level {userStats.level}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {userStats.unlockedAchievements}/{userStats.totalAchievements}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
            <div className="text-xs text-green-600 mt-1">
              {Math.round((userStats.unlockedAchievements / userStats.totalAchievements) * 100)}% complete
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
            <div className="text-xs text-orange-600 mt-1">
              Best: {userStats.longestStreak} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">#{userStats.rank}</div>
            <div className="text-sm text-gray-600">Leaderboard Rank</div>
            <div className="text-xs text-green-600 mt-1">
              Top {Math.round((userStats.rank / userStats.totalUsers) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Level Progress</h3>
            <Badge className="bg-blue-100 text-blue-800">
              Level {userStats.level}
            </Badge>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{userStats.totalPoints - userStats.pointsToNextLevel} points</span>
              <span>{userStats.totalPoints} total points</span>
            </div>
            <Progress 
              value={((userStats.totalPoints - userStats.pointsToNextLevel) / userStats.totalPoints) * 100} 
              className="h-3"
            />
          </div>
          <p className="text-sm text-gray-600">
            {userStats.pointsToNextLevel} more points to reach Level {userStats.level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'learning', 'social', 'milestone', 'streak', 'special'].map(category => (
              <Button
                key={category}
                variant={categoryFilter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Hours Studied</span>
                  <span className="font-medium">{userStats.hoursStudied}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Courses Completed</span>
                  <span className="font-medium">{userStats.coursesCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak</span>
                  <span className="font-medium flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    {userStats.currentStreak} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Longest Streak</span>
                  <span className="font-medium">{userStats.longestStreak} days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements
                    .filter(a => a.isUnlocked)
                    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
                    .slice(0, 3)
                    .map(achievement => {
                      const IconComponent = getAchievementIcon(achievement.icon);
                      return (
                        <div key={achievement.id} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-${achievement.color}-500 flex items-center justify-center`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{achievement.title}</h4>
                            <p className="text-xs text-gray-500">
                              +{achievement.points} points
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Reward Store</h3>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">{userStats.totalPoints} points</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map(reward => (
              <Card key={reward.id} className={cn(
                "transition-all duration-300 hover:shadow-lg",
                reward.isPurchased && "border-green-200 bg-green-50/50"
              )}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                      reward.isUnlocked 
                        ? reward.isPurchased 
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    )}>
                      {reward.isUnlocked ? (
                        <Gift className="h-8 w-8" />
                      ) : (
                        <Lock className="h-8 w-8" />
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-2">{reward.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">{reward.cost} pts</span>
                      {reward.isPurchased ? (
                        <Badge className="bg-green-100 text-green-800">Owned</Badge>
                      ) : reward.isUnlocked ? (
                        <Button 
                          size="sm" 
                          onClick={() => purchaseReward(reward)}
                          disabled={userStats.totalPoints < reward.cost}
                        >
                          Purchase
                        </Button>
                      ) : (
                        <Badge variant="secondary">Locked</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.rank}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      entry.name === 'You' ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        entry.rank <= 3 ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700"
                      )}>
                        {entry.rank <= 3 ? (
                          <Crown className="h-4 w-4" />
                        ) : (
                          entry.rank
                        )}
                      </div>
                      <div>
                        <div className={cn(
                          "font-medium",
                          entry.name === 'You' && "text-blue-700"
                        )}>
                          {entry.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Level {entry.level} • {entry.streak} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{entry.points.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AchievementSystem;