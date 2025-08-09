import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  BookOpen, 
  Brain, 
  MessageSquare,
  Shuffle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartQuestionSuggestionsProps {
  userRole?: string;
  currentSubject?: string;
  conversationHistory?: any[];
  onQuestionSelect: (question: string) => void;
  className?: string;
}

export function SmartQuestionSuggestions({ 
  userRole = 'student', 
  currentSubject,
  conversationHistory = [],
  onQuestionSelect,
  className 
}: SmartQuestionSuggestionsProps) {
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [suggestionCategory, setSuggestionCategory] = useState<string>('general');

  const questionCategories = {
    general: {
      icon: MessageSquare,
      color: 'blue',
      questions: [
        "How does this concept apply in real-world scenarios?",
        "What are the fundamental principles behind this?",
        "Can you break this down into simpler terms?",
        "What are some common misconceptions about this topic?",
        "How does this relate to what I've learned before?"
      ]
    },
    math: {
      icon: Brain,
      color: 'purple',
      questions: [
        "Can you show me the step-by-step solution process?",
        "What are the common mistakes students make with this?",
        "How can I check if my answer is correct?",
        "What's the intuitive way to think about this problem?",
        "When would I use this formula in practice?"
      ]
    },
    science: {
      icon: BookOpen,
      color: 'green',
      questions: [
        "What experiments demonstrate this principle?",
        "How was this theory discovered?",
        "What are the real-world applications?",
        "How does this connect to other scientific concepts?",
        "What would happen if we changed the variables?"
      ]
    },
    programming: {
      icon: TrendingUp,
      color: 'orange',
      questions: [
        "Can you provide a practical code example?",
        "What are the best practices for this?",
        "How does this compare to alternative approaches?",
        "What are the performance implications?",
        "How would I debug issues with this?"
      ]
    },
    advanced: {
      icon: Sparkles,
      color: 'red',
      questions: [
        "What are the latest research developments in this area?",
        "How would you teach this concept to others?",
        "What are the philosophical implications?",
        "How does this challenge existing paradigms?",
        "What are the unresolved questions in this field?"
      ]
    }
  };

  // Detect current subject from conversation or props
  useEffect(() => {
    let detectedCategory = 'general';
    
    if (currentSubject) {
      const subjectLower = currentSubject.toLowerCase();
      if (subjectLower.includes('math') || subjectLower.includes('algebra') || subjectLower.includes('calculus')) {
        detectedCategory = 'math';
      } else if (subjectLower.includes('science') || subjectLower.includes('physics') || subjectLower.includes('chemistry')) {
        detectedCategory = 'science';
      } else if (subjectLower.includes('programming') || subjectLower.includes('coding') || subjectLower.includes('javascript')) {
        detectedCategory = 'programming';
      }
    }

    // Analyze recent conversation for context
    const recentText = conversationHistory
      .slice(-3)
      .map(msg => msg.content)
      .join(' ')
      .toLowerCase();

    if (recentText.includes('code') || recentText.includes('function') || recentText.includes('programming')) {
      detectedCategory = 'programming';
    } else if (recentText.includes('equation') || recentText.includes('solve') || recentText.includes('calculate')) {
      detectedCategory = 'math';
    } else if (recentText.includes('experiment') || recentText.includes('theory') || recentText.includes('observe')) {
      detectedCategory = 'science';
    }

    // Use advanced questions for instructors
    if (userRole === 'instructor' && Math.random() > 0.7) {
      detectedCategory = 'advanced';
    }

    setSuggestionCategory(detectedCategory);
    
    // Select random questions from the category
    const categoryQuestions = questionCategories[detectedCategory as keyof typeof questionCategories]?.questions || questionCategories.general.questions;
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    setCurrentSuggestions(shuffled.slice(0, 3));
  }, [currentSubject, conversationHistory, userRole]);

  const shuffleSuggestions = () => {
    const categoryQuestions = questionCategories[suggestionCategory as keyof typeof questionCategories]?.questions || questionCategories.general.questions;
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    setCurrentSuggestions(shuffled.slice(0, 3));
  };

  const category = questionCategories[suggestionCategory as keyof typeof questionCategories] || questionCategories.general;
  const IconComponent = category.icon;

  return (
    <Card className={cn("border-dashed border-2 hover:border-solid transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <IconComponent className={`h-4 w-4 text-${category.color}-500`} />
            Smart Suggestions
            <Badge variant="secondary" className="text-xs">
              {suggestionCategory}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={shuffleSuggestions}
            className="h-7 w-7 p-0 hover:bg-gray-100"
          >
            <Shuffle className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentSuggestions.map((question, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => onQuestionSelect(question)}
            className={cn(
              "w-full text-left h-auto py-2 px-3 text-xs justify-start group hover:bg-gray-50 hover:border-gray-200 border border-transparent transition-all duration-200",
              `hover:text-${category.color}-700`
            )}
          >
            <Lightbulb className={`h-3 w-3 mr-2 shrink-0 text-${category.color}-400 group-hover:text-${category.color}-600`} />
            <span className="flex-1 text-gray-700 group-hover:text-gray-900">{question}</span>
            <ChevronRight className="h-3 w-3 ml-2 text-gray-400 group-hover:text-gray-600 shrink-0" />
          </Button>
        ))}
        
        <div className="pt-2 mt-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <Sparkles className="h-3 w-3" />
            <span>AI-powered suggestions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SmartQuestionSuggestions;