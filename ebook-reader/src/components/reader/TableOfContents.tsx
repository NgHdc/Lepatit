'use client';

import { Chapter } from '@/types/book';

interface TableOfContentsProps {
    chapters: Chapter[];
    currentChapter: number;
    onSelectChapter: (index: number) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function TableOfContents({
    chapters,
    currentChapter,
    onSelectChapter,
    isOpen,
    onClose
}: TableOfContentsProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Table of Contents</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Chapters List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {chapters.map((chapter, index) => (
                                <li key={chapter.id}>
                                    <button
                                        onClick={() => {
                                            onSelectChapter(index);
                                            onClose();
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${currentChapter === index
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{chapter.title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
