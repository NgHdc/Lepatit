'use client';

import { useState, useEffect } from 'react';
import { Chapter } from '@/types/book';

interface ReaderViewProps {
    chapter: Chapter;
    fontSize: number;
    onNextChapter: () => void;
    onPrevChapter: () => void;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function ReaderView({
    chapter,
    fontSize,
    onNextChapter,
    onPrevChapter,
    hasNext,
    hasPrev
}: ReaderViewProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, [chapter.id]);

    return (
        <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Chapter Title */}
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8 text-center">
                {chapter.title}
            </h2>

            {/* Chapter Content */}
            <article
                className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            >
                {chapter.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6 text-gray-800 dark:text-gray-200">
                        {paragraph}
                    </p>
                ))}
            </article>

            {/* Chapter Navigation */}
            <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onPrevChapter}
                    disabled={!hasPrev}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${hasPrev
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                            : 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>

                <button
                    onClick={onNextChapter}
                    disabled={!hasNext}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${hasNext
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
                            : 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}
                >
                    Next
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
