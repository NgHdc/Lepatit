'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ReaderControlsProps {
    bookTitle: string;
    currentChapter: number;
    totalChapters: number;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    progress: number;
}

export default function ReaderControls({
    bookTitle,
    currentChapter,
    totalChapters,
    fontSize,
    onFontSizeChange,
    progress
}: ReaderControlsProps) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        {/* Back Button */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Library</span>
                        </Link>

                        {/* Book Title */}
                        <h1 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-md">
                            {bookTitle}
                        </h1>

                        {/* Settings Button */}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 -mx-4 sm:-mx-6 bg-gray-200 dark:bg-gray-800">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="fixed top-16 right-4 z-50 w-72 p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Reading Settings</h3>

                    {/* Font Size */}
                    <div className="mb-4">
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Font Size</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}
                                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="text-sm">A-</span>
                            </button>
                            <div className="flex-1 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{fontSize}px</span>
                            </div>
                            <button
                                onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
                                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="text-lg">A+</span>
                            </button>
                        </div>
                    </div>

                    {/* Chapter Info */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Chapter</span>
                            <span className="text-gray-900 dark:text-white font-medium">{currentChapter} of {totalChapters}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-gray-900 dark:text-white font-medium">{Math.round(progress)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
