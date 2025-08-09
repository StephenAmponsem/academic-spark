import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Type, 
  MousePointer,
  Keyboard,
  Contrast,
  Focus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';

// Accessibility Context
interface AccessibilityContextType {
  fontSize: number;
  contrast: 'normal' | 'high' | 'inverted';
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  announcements: boolean;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

interface AccessibilitySettings {
  fontSize: number;
  contrast: 'normal' | 'high' | 'inverted';
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  announcements: boolean;
}

const AccessibilityContext = React.createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: 'normal',
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusVisible: true,
    announcements: true,
  });

  const [announcements, setAnnouncements] = React.useState<{
    id: string;
    message: string;
    priority: 'polite' | 'assertive';
  }[]>([]);

  const updateSettings = React.useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Apply settings to document
      document.documentElement.style.fontSize = `${updated.fontSize}px`;
      document.documentElement.classList.toggle('high-contrast', updated.contrast === 'high');
      document.documentElement.classList.toggle('inverted-contrast', updated.contrast === 'inverted');
      document.documentElement.classList.toggle('reduced-motion', updated.reducedMotion);
      document.documentElement.classList.toggle('focus-visible', updated.focusVisible);
      
      // Save to localStorage
      localStorage.setItem('accessibility-settings', JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announcements) return;
    
    const id = Math.random().toString(36).substr(2, 9);
    setAnnouncements(prev => [...prev, { id, message, priority }]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 5000);
  }, [settings.announcements]);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        updateSettings(parsedSettings);
      } catch (error) {
        console.warn('Failed to load accessibility settings:', error);
      }
    }
  }, [updateSettings]);

  // Detect system preferences
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      updateSettings({ reducedMotion: true });
    }

    const handleChange = (e: MediaQueryListEvent) => {
      updateSettings({ reducedMotion: e.matches });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [updateSettings]);

  const value: AccessibilityContextType = {
    ...settings,
    updateSettings,
    announce,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcements
          .filter(a => a.priority === 'polite')
          .map(a => <div key={a.id}>{a.message}</div>)
        }
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcements
          .filter(a => a.priority === 'assertive')
          .map(a => <div key={a.id}>{a.message}</div>)
        }
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Accessibility Control Panel
interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const {
    fontSize,
    contrast,
    reducedMotion,
    keyboardNavigation,
    focusVisible,
    announcements,
    updateSettings,
    announce
  } = useAccessibility();

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    updateSettings({ fontSize: newSize });
    announce(`Font size changed to ${newSize} pixels`);
  };

  const toggleContrast = () => {
    const modes = ['normal', 'high', 'inverted'] as const;
    const currentIndex = modes.indexOf(contrast);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateSettings({ contrast: nextMode });
    announce(`Contrast mode changed to ${nextMode}`);
  };

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <Card className="bg-background border shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Accessibility Settings
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close accessibility panel"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Size */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Font Size</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFontSizeChange(-2)}
                      aria-label="Decrease font size"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[4rem] text-center text-sm">
                      {fontSize}px
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFontSizeChange(2)}
                      aria-label="Increase font size"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Contrast */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Contrast Mode</label>
                  <Button
                    variant="outline"
                    onClick={toggleContrast}
                    className="w-full justify-start"
                    aria-label={`Current contrast: ${contrast}. Click to change.`}
                  >
                    <Contrast className="h-4 w-4 mr-2" />
                    {contrast === 'normal' && 'Normal Contrast'}
                    {contrast === 'high' && 'High Contrast'}
                    {contrast === 'inverted' && 'Inverted Colors'}
                  </Button>
                </div>

                {/* Motion */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Reduced Motion</label>
                    <Button
                      variant={reducedMotion ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateSettings({ reducedMotion: !reducedMotion });
                        announce(`Motion ${!reducedMotion ? 'reduced' : 'enabled'}`);
                      }}
                      aria-pressed={reducedMotion}
                    >
                      {reducedMotion ? <Check className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reduces or disables animations and transitions
                  </p>
                </div>

                {/* Keyboard Navigation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enhanced Keyboard Navigation</label>
                    <Button
                      variant={keyboardNavigation ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateSettings({ keyboardNavigation: !keyboardNavigation });
                        announce(`Keyboard navigation ${!keyboardNavigation ? 'enabled' : 'disabled'}`);
                      }}
                      aria-pressed={keyboardNavigation}
                    >
                      {keyboardNavigation ? <Check className="h-4 w-4" /> : <Keyboard className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enhanced keyboard shortcuts and tab navigation
                  </p>
                </div>

                {/* Focus Visible */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Visible Focus Indicators</label>
                    <Button
                      variant={focusVisible ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateSettings({ focusVisible: !focusVisible });
                        announce(`Focus indicators ${!focusVisible ? 'enabled' : 'disabled'}`);
                      }}
                      aria-pressed={focusVisible}
                    >
                      {focusVisible ? <Check className="h-4 w-4" /> : <Focus className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shows clear outlines when navigating with keyboard
                  </p>
                </div>

                {/* Announcements */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Screen Reader Announcements</label>
                    <Button
                      variant={announcements ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateSettings({ announcements: !announcements });
                        if (!announcements) {
                          announce('Screen reader announcements enabled');
                        }
                      }}
                      aria-pressed={announcements}
                    >
                      {announcements ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Provides audio feedback for actions and changes
                  </p>
                </div>

                {/* Reset */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateSettings({
                        fontSize: 16,
                        contrast: 'normal',
                        reducedMotion: false,
                        keyboardNavigation: true,
                        focusVisible: true,
                        announcements: true,
                      });
                      announce('Accessibility settings reset to defaults');
                    }}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Skip Link Component
export function SkipLink({ href = "#main-content", children = "Skip to main content" }: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
    >
      {children}
    </a>
  );
}

// Accessible Alert Component
interface AccessibleAlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  autoAnnounce?: boolean;
}

export function AccessibleAlert({ 
  type, 
  title, 
  children, 
  className, 
  onClose,
  autoAnnounce = true 
}: AccessibleAlertProps) {
  const { announce } = useAccessibility();

  const typeConfig = {
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    warning: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    success: { icon: Check, color: 'text-green-600', bg: 'bg-green-50 border-green-200' }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (autoAnnounce) {
      const message = title ? `${title}: ${children}` : String(children);
      announce(message, type === 'error' ? 'assertive' : 'polite');
    }
  }, [announce, autoAnnounce, type, title, children]);

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'border rounded-lg p-4',
        config.bg,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.color)} />
        <div className="flex-1">
          {title && (
            <h3 className={cn('font-semibold mb-1', config.color)}>
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close alert"
            className="flex-shrink-0"
          >
            ×
          </Button>
        )}
      </div>
    </div>
  );
}

// Focus Trap Component
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
}

export function FocusTrap({ children, active = true, restoreFocus = true }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, restoreFocus]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

// Accessible Progress Bar
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  showValue?: boolean;
}

export function AccessibleProgress({ 
  value, 
  max = 100, 
  label, 
  className, 
  showValue = true 
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          {showValue && (
            <span className="text-sm text-muted-foreground" aria-hidden="true">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${percentage}%`}
        className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="sr-only">
        {label ? `${label}: ` : ''}{percentage}% complete
      </span>
    </div>
  );
}