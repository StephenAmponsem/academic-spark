import Header from '@/components/Header';
import { DiscussionForums } from '@/components/forums/DiscussionForums';

export default function Forums() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <DiscussionForums />
      </main>
    </div>
  );
}