import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export function MobileMenu({ isOpen, onToggle, children, className }: MobileMenuProps) {
  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={onToggle}
        className={cn(
          'md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20',
          'flex items-center justify-center transition-all duration-300',
          className
        )}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={onToggle}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-16 left-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl z-50 md:hidden"
            >
              <div className="p-4 space-y-2">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface TouchFriendlyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function TouchFriendlyButton({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'md',
  className,
  disabled = false
}: TouchFriendlyButtonProps) {
  const sizeClasses = {
    sm: 'min-h-[44px] px-4 text-sm',
    md: 'min-h-[48px] px-6 text-base',
    lg: 'min-h-[52px] px-8 text-lg'
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileTap={disabled ? {} : { scale: 0.98 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
    >
      {children}
    </motion.button>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false, 
  icon: Icon,
  className 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <motion.div className={cn('border rounded-lg overflow-hidden', className)}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-background hover:bg-accent transition-colors"
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <h3 className="font-semibold text-left">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="p-4 border-t bg-accent/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className 
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        const threshold = 100;
        
        if (info.offset.x > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (info.offset.x < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      }}
      className={cn(
        'select-none cursor-grab active:cursor-grabbing',
        isDragging && 'z-10',
        className
      )}
      whileDrag={{ scale: 1.02, rotate: isDragging ? 2 : 0 }}
    >
      <Card className="touch-manipulation">
        {children}
      </Card>
    </motion.div>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const threshold = 80;

  const handleDragEnd = async (event: any, info: any) => {
    if (info.offset.y > threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.3, bottom: 0 }}
      onDrag={(event, info) => {
        if (info.offset.y > 0) {
          setPullDistance(Math.min(info.offset.y, threshold));
        }
      }}
      onDragEnd={handleDragEnd}
      className={cn('relative', className)}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {pullDistance > 20 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10"
          >
            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: pullDistance * 0.5 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  className 
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-background rounded-t-xl border-t z-50',
              'max-h-[80vh] overflow-hidden',
              className
            )}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
          >
            <div className="flex flex-col h-full">
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>
              
              {/* Header */}
              {title && (
                <div className="px-4 pb-3 border-b">
                  <h2 className="text-lg font-semibold">{title}</h2>
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface TabBarProps {
  tabs: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabBar({ tabs, activeTab, onTabChange, className }: TabBarProps) {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-40',
      'safe-area-inset-bottom',
      className
    )}>
      <div className="grid grid-cols-4 gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </motion.div>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Hook for detecting mobile devices
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Hook for safe area insets (notch support)
export function useSafeArea() {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  React.useEffect(() => {
    const updateSafeArea = () => {
      setSafeArea({
        top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0'),
        bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0'),
        left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0'),
        right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);

    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
}