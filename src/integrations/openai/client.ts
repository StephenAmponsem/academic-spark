import OpenAI from 'openai';

// Initialize OpenAI client with dynamic API key
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  
  console.log('API key found:', apiKey ? 'Yes' : 'No');
  console.log('API key starts with sk-:', apiKey?.startsWith('sk-'));
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add your API key to .env.local or configure it in Settings.');
  }

  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid API key format. API key should start with "sk-".');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Only for client-side usage
  });
};

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(
    messages: Message[],
    model: string = 'gpt-3.5-turbo',
    maxTokens: number = 1000,
    retryCount: number = 0
  ): Promise<AIResponse> {
    try {
      const openai = getOpenAIClient();
      console.log('Making OpenAI API request with model:', model);
      console.log('Messages count:', messages.length);
      
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
      
      console.log('OpenAI API response received successfully');
      
      return {
        content: response,
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (error.message.includes('429') && retryCount < 3) {
          // Retry with exponential backoff for rate limits
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.generateResponse(messages, model, maxTokens, retryCount + 1);
        } else if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please wait a few minutes and try again.');
        } else if (error.message.includes('insufficient_quota')) {
          throw new Error('Insufficient API credits. Please add credits to your OpenAI account.');
        } else {
          throw new Error(`OpenAI API Error: ${error.message}`);
        }
      }
      
      throw new Error('Failed to generate AI response');
    }
  }

  async generateEducationalResponse(
    userMessage: string,
    context: string = 'You are a helpful educational assistant. Provide clear, informative responses to help students learn.',
    conversationHistory: Message[] = []
  ): Promise<AIResponse> {
    const systemMessage: Message = {
      role: 'system',
      content: context,
    };

    const userMessageObj: Message = {
      role: 'user',
      content: userMessage,
    };

    const messages = [systemMessage, ...conversationHistory, userMessageObj];

    return this.generateResponse(messages, 'gpt-3.5-turbo', 800);
  }

  async generateCourseSpecificResponse(
    userMessage: string,
    courseContext: string,
    conversationHistory: Message[] = []
  ): Promise<AIResponse> {
    const systemMessage: Message = {
      role: 'system',
      content: `You are an expert educational assistant for the course: ${courseContext}. Provide detailed, accurate, and helpful responses based on the course material. Always encourage learning and provide additional resources when appropriate.`,
    };

    const userMessageObj: Message = {
      role: 'user',
      content: userMessage,
    };

    const messages = [systemMessage, ...conversationHistory, userMessageObj];

    return this.generateResponse(messages, 'gpt-3.5-turbo', 1000);
  }
}

export const aiService = AIService.getInstance(); 