import { useParams } from 'react-router-dom';
import { AIExamProctoring } from '@/components/proctoring/AIExamProctoring';
import Header from '@/components/Header';

export default function ExamProctoring() {
  const { examId } = useParams<{ examId: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <AIExamProctoring examId={examId || 'default-exam'} />
      </main>
    </div>
  );
}