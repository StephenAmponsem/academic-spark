// Advanced animation utilities for premium UI/UX experience

// Easing functions for smooth animations
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  elastic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};

// Animation durations (in ms)
export const durations = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
};

// Stagger delays for list animations
export const staggerDelay = (index: number, baseDelay = 50) => index * baseDelay;

// Common animation variants for Framer Motion
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: easings.easeOut },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: easings.easeOut },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: easings.easeOut },
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: easings.easeOut },
};

export const scaleOnHover = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  transition: { duration: 0.2, ease: easings.easeOut },
};

export const bounceOnHover = {
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.9 },
  transition: { duration: 0.2, ease: easings.bounce },
};

export const floatingAnimation = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

export const pulseAnimation = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

export const shimmerAnimation = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: easings.easeOut },
};

// Container stagger animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easings.easeOut },
};

// Loading animations
export const spinAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const breathingAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

// Interactive button animations
export const buttonPress = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.02 },
  transition: { duration: 0.1, ease: easings.easeOut },
};

export const iconBounce = {
  whileHover: { scale: 1.2, rotate: 10 },
  whileTap: { scale: 0.9 },
  transition: { duration: 0.2, ease: easings.bounce },
};

// Card hover effects
export const cardHover = {
  whileHover: {
    y: -5,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transition: { duration: 0.3, ease: easings.easeOut },
  },
};

export const cardPress = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1, ease: easings.easeOut },
};

// Navigation animations
export const navItemHover = {
  whileHover: {
    scale: 1.05,
    textShadow: '0 0 8px rgba(0,0,0,0.3)',
    transition: { duration: 0.2, ease: easings.easeOut },
  },
};

// Progress bar animations
export const progressFill = {
  initial: { width: 0 },
  animate: { width: '100%' },
  transition: { duration: 1, ease: easings.easeOut },
};

// Modal animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { duration: 0.3, ease: easings.easeOut },
};

// Notification animations
export const notificationSlide = {
  initial: { opacity: 0, x: 300 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 300 },
  transition: { duration: 0.3, ease: easings.easeOut },
};

// Tab switching animations
export const tabContent = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: easings.easeOut },
};

// List item animations
export const listItemSlide = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2, ease: easings.easeOut },
};

// Utility functions
export const createStaggeredAnimation = (items: any[], baseDelay = 0.1) => {
  return items.map((item, index) => ({
    ...item,
    transition: {
      ...item.transition,
      delay: index * baseDelay,
    },
  }));
};

export const createSpringAnimation = (stiffness = 100, damping = 10) => ({
  type: 'spring',
  stiffness,
  damping,
});

// CSS-in-JS animation helpers
export const fadeIn = (duration = '0.3s', delay = '0s') => ({
  animation: `fadeIn ${duration} ${easings.easeOut} ${delay} forwards`,
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
});

export const slideUp = (duration = '0.3s', delay = '0s') => ({
  animation: `slideUp ${duration} ${easings.easeOut} ${delay} forwards`,
  '@keyframes slideUp': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
});

export const scaleIn = (duration = '0.2s', delay = '0s') => ({
  animation: `scaleIn ${duration} ${easings.easeOut} ${delay} forwards`,
  '@keyframes scaleIn': {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
});