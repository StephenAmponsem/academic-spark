import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bot, 
  Lightbulb, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  BookOpen,
  Sparkles,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIResponseProps {
  response: {
    content: string;
    confidence: number;
    sources?: string[];
    suggestedQuestions?: string[];
  };
  onSuggestedQuestion?: (question: string) => void;
  className?: string;
}

export function EnhancedAIResponse({ response, onSuggestedQuestion, className }: AIResponseProps) {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.8) return 'Good Confidence';
    if (confidence >= 0.7) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response.content);
      toast.success('Response copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy response');
    }
  };

  const handleFeedback = (helpful: boolean) => {
    setIsHelpful(helpful);
    toast.success(
      helpful ? 'Thanks for the positive feedback!' : 'Thanks for the feedback! We\'ll improve our responses.'
    );
  };

  return (
    <Card className={cn("border-l-4 border-l-purple-500 shadow-sm", className)}>
      <CardContent className="p-4">
        {/* AI Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-8 w-8 border-2 border-purple-200">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600">
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">AI Learning Assistant</span>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getConfidenceColor(response.confidence))}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {getConfidenceText(response.confidence)}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              Confidence: {Math.round(response.confidence * 100)}%
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Response Content */}
        <div className="prose prose-sm max-w-none mb-4">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {response.content}
          </div>
        </div>

        {/* Sources */}
        {response.sources && response.sources.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sources</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {response.sources.map((source, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-gray-100">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {response.suggestedQuestions && response.suggestedQuestions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Continue Learning</span>
            </div>
            <div className="space-y-2">
              {response.suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onSuggestedQuestion?.(question)}
                  className="text-left h-auto py-2 px-3 text-xs text-gray-700 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50 justify-start w-full"
                >
                  <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
                  <span className="truncate">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Was this response helpful?</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(true)}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-green-50",
                  isHelpful === true && "bg-green-50 text-green-600"
                )}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(false)}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-red-50",
                  isHelpful === false && "bg-red-50 text-red-600"
                )}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Sparkles className="h-3 w-3" />
            <span>Powered by AI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedAIResponse;