import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleSelectionProps {
  onRoleSelect: (role: 'student' | 'instructor') => void;
  selectedRole?: 'student' | 'instructor' | null;
  className?: string;
}

export function RoleSelection({ onRoleSelect, selectedRole, className }: RoleSelectionProps) {
  const roles = [
    {
      id: 'student' as const,
      title: 'Student',
      subtitle: 'Learn and grow with AI assistance',
      description: 'Access courses, AI tutoring, collaborative learning, and track your progress.',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
      features: [
        { icon: BookOpen, text: 'Access all courses' },
        { icon: Brain, text: 'AI tutor & Q&A' },
        { icon: Users, text: 'Study groups & collaboration' },
        { icon: Target, text: 'Progress tracking' },
        { icon: Award, text: 'Achievements & badges' }
      ],
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'instructor' as const,
      title: 'Instructor',
      subtitle: 'Teach and manage courses',
      description: 'Create courses, manage students, access analytics, and use teaching tools.',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
      features: [
        { icon: BookOpen, text: 'Create & manage courses' },
        { icon: Users, text: 'Student management' },
        { icon: BarChart3, text: 'Analytics & insights' },
        { icon: Brain, text: 'AI teaching assistant' },
        { icon: Target, text: 'Assessment tools' }
      ],
      badge: 'Pro Features',
      badgeColor: 'bg-purple-500'
    }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Choose Your Learning Journey
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          How do you want to use EDUConnect?
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select your role to get a personalized experience tailored to your needs
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {roles.map((role, index) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cn(
                  'h-full cursor-pointer transition-all duration-300 relative overflow-hidden',
                  'hover:shadow-2xl border-2',
                  isSelected 
                    ? 'border-blue-500 shadow-xl ring-2 ring-blue-500 ring-opacity-50' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => onRoleSelect(role.id)}
              >
                {/* Background Gradient */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-5',
                  role.color
                )} />
                
                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 z-10"
                  >
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </motion.div>
                )}

                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className={cn('text-white border-0', role.badgeColor)}>
                    {role.badge}
                  </Badge>
                </div>

                <CardHeader className="pb-4 pt-16">
                  <div className="space-y-4">
                    <div className={cn(
                      'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto',
                      role.color
                    )}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="text-center">
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {role.title}
                      </CardTitle>
                      <p className="text-gray-600 font-medium mt-1">
                        {role.subtitle}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-gray-700 text-center">
                    {role.description}
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      What you get:
                    </h4>
                    <div className="space-y-2">
                      {role.features.map((feature, featureIndex) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <motion.div
                            key={featureIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center',
                              role.color
                            )}>
                              <FeatureIcon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-gray-700 text-sm">
                              {feature.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    className={cn(
                      'w-full mt-6 bg-gradient-to-r text-white font-medium transition-all duration-300',
                      isSelected 
                        ? role.color + ' shadow-lg' 
                        : 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRoleSelect(role.id);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      <>
                        Choose {role.title}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 font-medium">
              ✨ Perfect! You've selected <strong>{selectedRole}</strong> role. 
              Continue to sign up and start your journey!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}