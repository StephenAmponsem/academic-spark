import Header from '@/components/Header';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';

export default function Search() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Discover Learning Content
            </h1>
            <p className="text-gray-600">
              Use our AI-powered search to find exactly what you need to learn
            </p>
          </div>

          <AdvancedSearch />
        </div>
      </main>
    </div>
  );
}