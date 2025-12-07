'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BookCard from '@/components/BookCard';
import AddBookModal from '@/components/AddBookModal';
import { sampleBooks } from '@/data/books';
import { getAllBooks, getAllProgress } from '@/lib/bookStorage';
import { LocalBook, ReadingProgress, Book } from '@/types/book';

// Simulated reading progress for sample books
const sampleProgress = [
  { bookId: '1', progress: 35, lastRead: '2 hours ago' },
  { bookId: '3', progress: 68, lastRead: 'Yesterday' },
];

export default function Home() {
  const [localBooks, setLocalBooks] = useState<LocalBook[]>([]);
  const [localProgress, setLocalProgress] = useState<ReadingProgress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load local books on mount
  useEffect(() => {
    const loadBooks = async () => {
      const books = await getAllBooks();
      const progress = await getAllProgress();
      setLocalBooks(books);
      setLocalProgress(progress);
      setIsLoaded(true);
    };
    loadBooks();
  }, []);

  const handleBookAdded = (book: LocalBook) => {
    setLocalBooks(prev => [book, ...prev]);
  };

  const genres = [...new Set(sampleBooks.map(book => book.genre))];

  // Get books that are currently being read (both local and sample)
  const continueReading = [
    // Local books with progress
    ...localProgress.map(progress => {
      const book = localBooks.find(b => b.id === progress.bookId);
      if (!book) return null;
      const timeDiff = Date.now() - new Date(progress.lastRead).getTime();
      const lastRead = timeDiff < 3600000 ? 'Just now' :
        timeDiff < 86400000 ? `${Math.floor(timeDiff / 3600000)} hours ago` :
          'Yesterday';
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        progress: progress.percentComplete,
        lastRead,
        isLocal: true,
      };
    }).filter(Boolean),
    // Sample books with progress
    ...sampleProgress.map(progress => {
      const book = sampleBooks.find(b => b.id === progress.bookId);
      if (!book) return null;
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        progress: progress.progress,
        lastRead: progress.lastRead,
        isLocal: false,
      };
    }).filter(Boolean),
  ];

  // All books for library (local first, then not-started samples)
  const notStartedSamples = sampleBooks.filter(
    book => !sampleProgress.find(p => p.bookId === book.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Continue Reading Section - Hero */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-400/20 to-pink-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Welcome back</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {continueReading.length > 0 ? 'Continue Reading' : 'Start Reading'}
              </h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Book</span>
            </button>
          </div>

          {/* Continue Reading Cards or Empty State */}
          {continueReading.length > 0 ? (
            <div className="grid gap-4 md:gap-6">
              {continueReading.map((item, index) => item && (
                <Link
                  key={item.id}
                  href={`/reader/${item.id}`}
                  className="group relative flex gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Book Cover Thumbnail */}
                  <div className="flex-shrink-0 w-16 md:w-20 aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(item.id)}`}>
                      <div className="w-full h-full flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <span className="text-[10px] text-white font-medium line-clamp-2">{item.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.isLocal && (
                          <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                            EPUB
                          </span>
                        )}
                        <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
                          {item.lastRead}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        <span>Progress</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">{item.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Continue Button */}
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Continue reading
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No books yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Add your first EPUB book or browse the sample library below
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Book
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative py-6 border-y border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {localBooks.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">My Books</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                {continueReading.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reading</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                {sampleBooks.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Samples</p>
            </div>
          </div>
        </div>
      </section>

      {/* My Books Section (if any local books) */}
      {localBooks.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  My Books
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your uploaded EPUB files
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {localBooks.map((book, index) => (
                <Link
                  key={book.id}
                  href={`/reader/${book.id}`}
                  className="group block"
                >
                  <div className="relative transform transition-all duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-2">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl group-hover:shadow-2xl transition-shadow duration-500">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(book.id)}`} />
                      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <h3 className="font-serif text-lg font-bold text-white leading-tight mb-1 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-sm text-white/80 font-medium">
                          {book.author}
                        </p>
                      </div>
                      {/* EPUB Badge */}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full">
                        <span className="text-xs text-white font-medium">EPUB</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sample Library Section */}
      <section id="library" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Sample Library
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try these sample books
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                All
              </button>
              {genres.slice(0, 3).map((genre) => (
                <button
                  key={genre}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Book Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
            {notStartedSamples.map((book, index) => (
              <div
                key={book.id}
                className="animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <BookCard book={book} progress={0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Lepatit Reader. Made with ❤️ for book lovers.
          </p>
        </div>
      </footer>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onBookAdded={handleBookAdded}
      />
    </div>
  );
}

function getGradient(id: string): string {
  const gradients = [
    'from-violet-600 via-purple-600 to-indigo-700',
    'from-rose-600 via-pink-600 to-fuchsia-700',
    'from-amber-500 via-orange-500 to-red-600',
    'from-emerald-500 via-teal-500 to-cyan-600',
    'from-blue-600 via-indigo-600 to-violet-700',
    'from-slate-600 via-gray-700 to-zinc-800',
  ];
  // Use hash of id for consistent but varied colors
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}
