import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  ExternalLink,
  Bookmark,
  Share2,
  MoreVertical,
  Star,
  Eye,
  Clock,
  Users
} from 'lucide-react';

interface EnhancedCardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'hover-lift' | 'glow' | 'premium';
  interactive?: boolean;
  featured?: boolean;
  onClick?: () => void;
}

export function EnhancedCard({ 
  children, 
  className, 
  variant = 'default', 
  interactive = false,
  featured = false,
  onClick 
}: EnhancedCardProps) {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl',
    'hover-lift': 'bg-white border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2',
    glow: 'bg-white border border-gray-200 shadow-lg hover:shadow-blue-500/25 transition-all duration-300',
    premium: 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg'
  };

  const baseClasses = cn(
    'rounded-xl overflow-hidden transition-all duration-300',
    variantClasses[variant],
    interactive && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
    featured && 'ring-2 ring-blue-500 ring-opacity-50',
    className
  );

  const CardComponent = onClick ? 'div' : Card;

  return (
    <CardComponent 
      className={baseClasses}
      onClick={onClick}
    >
      {featured && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Featured
          </div>
        </div>
      )}
      {children}
    </CardComponent>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  stats?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  className?: string;
  variant?: 'default' | 'premium' | 'success' | 'warning';
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  stats,
  className,
  variant = 'default'
}: FeatureCardProps) {
  const variantStyles = {
    default: {
      container: 'bg-white border border-gray-200',
      icon: 'bg-blue-100 text-blue-600',
      accent: 'text-blue-600'
    },
    premium: {
      container: 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200',
      icon: 'bg-purple-100 text-purple-600',
      accent: 'text-purple-600'
    },
    success: {
      container: 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200',
      icon: 'bg-green-100 text-green-600',
      accent: 'text-green-600'
    },
    warning: {
      container: 'bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200',
      icon: 'bg-orange-100 text-orange-600',
      accent: 'text-orange-600'
    }
  };

  const styles = variantStyles[variant];

  return (
    <EnhancedCard 
      className={cn(styles.container, className)}
      variant="hover-lift"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-full', styles.icon)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {stats && (
        <CardContent className="py-0">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  {stat.trend && (
                    <TrendingUp 
                      className={cn(
                        'h-4 w-4',
                        stat.trend === 'up' ? 'text-green-500' :
                        stat.trend === 'down' ? 'text-red-500 rotate-180' : 'text-gray-400'
                      )} 
                    />
                  )}
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {action && (
        <CardContent className="pt-0">
          <Button 
            onClick={action.onClick} 
            className="w-full"
            variant="outline"
          >
            {action.label}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      )}
    </EnhancedCard>
  );
}

interface CourseCardProps {
  title: string;
  description: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  price?: string;
  thumbnail?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isBookmarked?: boolean;
  progress?: number;
  onEnroll?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  className?: string;
}

export function CourseCard({
  title,
  description,
  instructor,
  rating,
  students,
  duration,
  price,
  thumbnail,
  tags,
  difficulty,
  isBookmarked = false,
  progress,
  onEnroll,
  onBookmark,
  onShare,
  className
}: CourseCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <EnhancedCard 
      className={cn('group overflow-hidden', className)}
      variant="hover-lift"
      interactive
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/80 text-center">
              <div className="text-4xl font-bold mb-2">{title.charAt(0)}</div>
              <div className="text-sm opacity-75">Course Thumbnail</div>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
        
        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.();
            }}
          >
            <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn('text-xs border', difficultyColors[difficulty])}>
            {difficulty}
          </Badge>
        </div>

        {/* Price */}
        {price && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm font-bold text-gray-900">{price}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title and Description */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">{instructor.charAt(0)}</span>
          </div>
          <span className="text-sm text-gray-700">{instructor}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={onEnroll}
          className="w-full"
          variant={progress !== undefined ? "outline" : "default"}
        >
          {progress !== undefined ? 'Continue Learning' : 'Enroll Now'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </EnhancedCard>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  className 
}: MetricCardProps) {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      accent: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-100 text-green-600',
      accent: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      accent: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-100 text-orange-600',
      accent: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-100 text-red-600',
      accent: 'text-red-600'
    }
  };

  const styles = colorStyles[color];

  return (
    <EnhancedCard className={cn(styles.bg, 'border-0', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp 
                  className={cn(
                    'h-4 w-4',
                    change.type === 'increase' ? 'text-green-500' : 'text-red-500 rotate-180'
                  )} 
                />
                <span 
                  className={cn(
                    'text-sm font-medium',
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change.value}% {change.period}
                </span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-full', styles.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </EnhancedCard>
  );
}