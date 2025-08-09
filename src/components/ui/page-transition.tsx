import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LoadingSpinner, FloatingIcons } from './loading-states';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 0.98
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={cn('min-h-screen', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function FadeInView({ 
  children, 
  delay = 0, 
  direction = 'up',
  className 
}: FadeInViewProps) {
  const directionVariants = {
    up: { y: 40, opacity: 0 },
    down: { y: -40, opacity: 0 },
    left: { x: 40, opacity: 0 },
    right: { x: -40, opacity: 0 }
  };

  return (
    <motion.div
      initial={directionVariants[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerChildren({ 
  children, 
  staggerDelay = 0.1,
  className 
}: StaggerChildrenProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  scale?: number;
  className?: string;
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  scale = 0.8,
  className 
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ scale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  distance?: number;
  className?: string;
}

export function SlideIn({ 
  children, 
  direction = 'right', 
  delay = 0, 
  distance = 50,
  className 
}: SlideInProps) {
  const initialValues = {
    left: { x: -distance, opacity: 0 },
    right: { x: distance, opacity: 0 },
    up: { y: -distance, opacity: 0 },
    down: { y: distance, opacity: 0 }
  };

  return (
    <motion.div
      initial={initialValues[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface BouncyCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  whileHover?: boolean;
}

export function BouncyCard({ 
  children, 
  delay = 0,
  className,
  whileHover = true
}: BouncyCardProps) {
  const hoverVariants = whileHover ? {
    whileHover: {
      scale: 1.03,
      y: -5,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    whileTap: {
      scale: 0.98
    }
  } : {};

  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15
      }}
      {...hoverVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({ 
  text, 
  speed = 50, 
  className,
  onComplete 
}: TypewriterProps) {
  const [displayText, setDisplayText] = React.useState('');
  const [showCursor, setShowCursor] = React.useState(true);

  React.useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        onComplete?.();
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ 
  value, 
  duration = 2000,
  className, 
  prefix = '', 
  suffix = '' 
}: CountUpProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const updateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart);
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration]);

  return (
    <motion.span 
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'backOut' }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  amplitude?: number;
  frequency?: number;
  className?: string;
}

export function FloatingElement({ 
  children, 
  amplitude = 10, 
  frequency = 2,
  className 
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration: frequency,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function Pulse({ 
  children, 
  scale = 1.05, 
  duration = 2,
  className 
}: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ShakeProps {
  children: React.ReactNode;
  intensity?: number;
  duration?: number;
  trigger?: boolean;
  className?: string;
}

export function Shake({ 
  children, 
  intensity = 5, 
  duration = 0.5,
  trigger = false,
  className 
}: ShakeProps) {
  return (
    <motion.div
      animate={trigger ? {
        x: [-intensity, intensity, -intensity, intensity, 0],
      } : {}}
      transition={{
        duration,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RotateProps {
  children: React.ReactNode;
  angle?: number;
  duration?: number;
  direction?: 'clockwise' | 'counterclockwise';
  infinite?: boolean;
  className?: string;
}

export function Rotate({ 
  children, 
  angle = 360, 
  duration = 2,
  direction = 'clockwise',
  infinite = false,
  className 
}: RotateProps) {
  const finalAngle = direction === 'clockwise' ? angle : -angle;

  return (
    <motion.div
      animate={{
        rotate: infinite ? [0, finalAngle] : finalAngle,
      }}
      transition={{
        duration,
        repeat: infinite ? Infinity : 0,
        ease: 'linear'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface MorphProps {
  children: React.ReactNode;
  borderRadius?: string[];
  duration?: number;
  className?: string;
}

export function Morph({ 
  children, 
  borderRadius = ['0%', '50%', '0%'], 
  duration = 3,
  className 
}: MorphProps) {
  return (
    <motion.div
      animate={{
        borderRadius,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface LoadingTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export function LoadingTransition({ 
  isLoading, 
  children, 
  loadingComponent,
  className 
}: LoadingTransitionProps) {
  const defaultLoading = (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
      <LoadingSpinner size="lg" variant="gradient" />
      <FloatingIcons className="w-full h-32" />
      <p className="text-gray-600 animate-pulse">Loading amazing content...</p>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {loadingComponent || defaultLoading}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}