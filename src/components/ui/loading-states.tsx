import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Loader2, 
  Brain, 
  Sparkles, 
  Zap, 
  Heart,
  Star,
  BookOpen,
  Users,
  TrendingUp
} from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse' | 'bounce';
  className?: string;
}

export function LoadingSpinner({ size = 'md', variant = 'default', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'text-blue-500',
    gradient: 'text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text',
    pulse: 'text-blue-500 animate-pulse',
    bounce: 'text-blue-500'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 
        className={cn(
          sizeClasses[size], 
          variantClasses[variant],
          'animate-spin',
          variant === 'bounce' && 'animate-bounce'
        )} 
      />
    </div>
  );
}

interface PulsingDotsProps {
  className?: string;
  color?: 'blue' | 'purple' | 'green' | 'orange';
}

export function PulsingDots({ className, color = 'blue' }: PulsingDotsProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full animate-pulse',
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showAvatar?: boolean;
  lines?: number;
}

export function SkeletonCard({ className, showHeader = true, showAvatar = false, lines = 3 }: SkeletonCardProps) {
  return (
    <Card className={cn('animate-pulse', className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              'h-3',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )} 
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface ShimmerBoxProps {
  className?: string;
  rounded?: boolean;
}

export function ShimmerBox({ className, rounded = true }: ShimmerBoxProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-200',
        rounded && 'rounded-lg',
        className
      )}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          animation: 'shimmer 2s infinite linear'
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

interface FloatingIconsProps {
  className?: string;
}

export function FloatingIcons({ className }: FloatingIconsProps) {
  const icons = [Brain, Sparkles, Zap, Heart, Star, BookOpen, Users, TrendingUp];
  
  return (
    <div className={cn('relative', className)}>
      {icons.map((Icon, index) => (
        <Icon
          key={index}
          className={cn(
            'absolute h-6 w-6 text-blue-200 opacity-20',
            'animate-float'
          )}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(5deg);
          }
          66% {
            transform: translateY(5px) rotate(-3deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

interface ProgressiveLoadingProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressiveLoading({ steps, currentStep, className }: ProgressiveLoadingProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" variant="gradient" className="mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">
          {steps[currentStep] || 'Loading...'}
        </h3>
      </div>
      
      <div className="flex justify-center space-x-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index <= currentStep 
                ? 'bg-blue-500 scale-110' 
                : 'bg-gray-300'
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 50, className, onComplete }: TypewriterTextProps) {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

interface PulseLoaderProps {
  className?: string;
  color?: string;
}

export function PulseLoader({ className, color = 'blue' }: PulseLoaderProps) {
  return (
    <div className={cn('flex justify-center items-center space-x-2', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-3 h-3 rounded-full animate-pulse',
            `bg-${color}-500`
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
}

interface GradientLoaderProps {
  className?: string;
  text?: string;
}

export function GradientLoader({ className, text = 'Loading...' }: GradientLoaderProps) {
  return (
    <div className={cn('text-center space-y-4', className)}>
      <div className="relative">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin">
          <div className="absolute inset-1 bg-white rounded-full" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
        </div>
      </div>
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
}

interface WaveLoaderProps {
  className?: string;
}

export function WaveLoader({ className }: WaveLoaderProps) {
  return (
    <div className={cn('flex justify-center items-end space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 bg-blue-500 rounded-full animate-wave"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: '20px'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 40%, 100% {
            transform: scaleY(0.4);
          }
          20% {
            transform: scaleY(1);
          }
        }
        .animate-wave {
          animation: wave 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonList({ items = 5, showAvatar = true, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  className, 
  prefix = '', 
  suffix = '' 
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}