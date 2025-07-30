import { aiService } from './client';
import type { Message } from './client';

export interface EducationalContext {
  courseName?: string;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export class EducationalAI {
  private static instance: EducationalAI;

  private constructor() {}

  public static getInstance(): EducationalAI {
    if (!EducationalAI.instance) {
      EducationalAI.instance = new EducationalAI();
    }
    return EducationalAI.instance;
  }

  async generateExplanation(
    question: string,
    context: EducationalContext = {},
    conversationHistory: Message[] = []
  ) {
    const systemPrompt = this.buildSystemPrompt('explanation', context);
    return aiService.generateEducationalResponse(question, systemPrompt, conversationHistory);
  }

  async generateStepByStepGuide(
    question: string,
    context: EducationalContext = {},
    conversationHistory: Message[] = []
  ) {
    const systemPrompt = this.buildSystemPrompt('step-by-step', context);
    return aiService.generateEducationalResponse(question, systemPrompt, conversationHistory);
  }

  async generatePracticeProblem(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    context: EducationalContext = {}
  ) {
    const systemPrompt = `You are an expert educational assistant. Generate a practice problem for the topic: ${topic}. 
    
    Requirements:
    - Difficulty level: ${difficulty}
    - Include the problem statement
    - Provide a step-by-step solution
    - Include explanations for each step
    - Add a brief explanation of the concepts involved
    
    Format the response clearly with sections for Problem, Solution, and Explanation.`;

    return aiService.generateEducationalResponse(
      `Create a ${difficulty} practice problem about ${topic}`,
      systemPrompt,
      []
    );
  }

  async generateStudyTips(
    subject: string,
    context: EducationalContext = {}
  ) {
    const systemPrompt = `You are an expert educational assistant specializing in study strategies. 
    
    Provide practical study tips for ${subject} that include:
    - Active learning techniques
    - Memory retention strategies
    - Time management advice
    - Recommended resources
    - Practice exercises
    
    Make the tips actionable and specific to ${subject}.`;

    return aiService.generateEducationalResponse(
      `Give me study tips for ${subject}`,
      systemPrompt,
      []
    );
  }

  async generateConceptClarification(
    concept: string,
    context: EducationalContext = {},
    conversationHistory: Message[] = []
  ) {
    const systemPrompt = this.buildSystemPrompt('clarification', context);
    return aiService.generateEducationalResponse(
      `Please explain the concept of ${concept} in simple terms`,
      systemPrompt,
      conversationHistory
    );
  }

  async generateRealWorldExample(
    concept: string,
    context: EducationalContext = {}
  ) {
    const systemPrompt = `You are an expert educational assistant. Provide real-world examples and applications for the concept: ${concept}.
    
    Include:
    - Practical examples from everyday life
    - Industry applications
    - Historical context if relevant
    - Why this concept matters
    
    Make the examples relatable and easy to understand.`;

    return aiService.generateEducationalResponse(
      `Give me real-world examples of ${concept}`,
      systemPrompt,
      []
    );
  }

  private buildSystemPrompt(type: string, context: EducationalContext): string {
    let prompt = 'You are an expert educational assistant. ';

    switch (type) {
      case 'explanation':
        prompt += 'Provide clear, comprehensive explanations that break down complex concepts into understandable parts. ';
        break;
      case 'step-by-step':
        prompt += 'Provide detailed step-by-step guidance with clear explanations for each step. Use numbered lists and bullet points for clarity. ';
        break;
      case 'clarification':
        prompt += 'Clarify concepts using simple language and analogies. Start with basic understanding and gradually build complexity. ';
        break;
      default:
        prompt += 'Provide helpful, educational responses. ';
    }

    if (context.courseName) {
      prompt += `Focus on the context of ${context.courseName}. `;
    }

    if (context.subject) {
      prompt += `Specialize in ${context.subject}. `;
    }

    if (context.difficulty) {
      prompt += `Adjust the complexity level for ${context.difficulty} learners. `;
    }

    if (context.learningStyle) {
      prompt += `Adapt explanations for ${context.learningStyle} learners. `;
    }

    prompt += 'Always encourage questions and provide practical examples when possible.';

    return prompt;
  }

  async analyzeLearningProgress(
    conversationHistory: Message[],
    context: EducationalContext = {}
  ) {
    const systemPrompt = `You are an expert educational assistant analyzing learning progress. 
    
    Based on the conversation history, provide:
    - Assessment of current understanding level
    - Areas that need more focus
    - Suggested next learning steps
    - Confidence level in the topic
    - Recommended practice areas
    
    Be encouraging and constructive in your analysis.`;

    const historyText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return aiService.generateEducationalResponse(
      `Analyze my learning progress based on this conversation:\n\n${historyText}`,
      systemPrompt,
      []
    );
  }
}

export const educationalAI = EducationalAI.getInstance(); 