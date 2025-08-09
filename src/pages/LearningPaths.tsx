import Header from '@/components/Header';
import { DynamicLearningPathGenerator } from '@/components/learning-paths/DynamicLearningPathGenerator';

export default function LearningPaths() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <DynamicLearningPathGenerator />
      </main>
    </div>
  );
}