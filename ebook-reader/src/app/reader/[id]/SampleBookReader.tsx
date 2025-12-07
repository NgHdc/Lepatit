'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBookById } from '@/data/books';
import ReaderView from '@/components/reader/ReaderView';
import ReaderControls from '@/components/reader/ReaderControls';
import TableOfContents from '@/components/reader/TableOfContents';

interface SampleBookReaderProps {
    bookId: string;
}

export default function SampleBookReader({ bookId }: SampleBookReaderProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialChapter = parseInt(searchParams.get('chapter') || '0');

    const [currentChapter, setCurrentChapter] = useState(initialChapter);
    const [fontSize, setFontSize] = useState(18);
    const [showToc, setShowToc] = useState(false);

    const book = getBookById(bookId);

    useEffect(() => {
        // Scroll to top when chapter changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentChapter]);

    if (!book) {
        router.push('/');
        return null;
    }

    const chapter = book.chapters[currentChapter];
    const progress = ((currentChapter + 1) / book.chapters.length) * 100;

    const goToNextChapter = () => {
        if (currentChapter < book.chapters.length - 1) {
            setCurrentChapter(currentChapter + 1);
        }
    };

    const goToPrevChapter = () => {
        if (currentChapter > 0) {
            setCurrentChapter(currentChapter - 1);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Controls */}
            <ReaderControls
                bookTitle={book.title}
                currentChapter={currentChapter + 1}
                totalChapters={book.chapters.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                progress={progress}
            />

            {/* TOC Toggle Button */}
            <button
                onClick={() => setShowToc(true)}
                className="fixed left-4 top-20 z-40 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Table of contents"
            >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            </button>

            {/* Table of Contents */}
            <TableOfContents
                chapters={book.chapters}
                currentChapter={currentChapter}
                onSelectChapter={setCurrentChapter}
                isOpen={showToc}
                onClose={() => setShowToc(false)}
            />

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-6 md:px-8 pt-24 pb-16">
                <ReaderView
                    chapter={chapter}
                    fontSize={fontSize}
                    onNextChapter={goToNextChapter}
                    onPrevChapter={goToPrevChapter}
                    hasNext={currentChapter < book.chapters.length - 1}
                    hasPrev={currentChapter > 0}
                />
            </main>
        </div>
    );
}
