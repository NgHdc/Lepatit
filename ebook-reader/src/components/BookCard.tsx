'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Book } from '@/types/book';

interface BookCardProps {
    book: Book;
    progress?: number;
}

export default function BookCard({ book, progress = 0 }: BookCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={`/book/${book.id}`}>
            <div
                className="group relative cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Book Card Container */}
                <div className="relative transform transition-all duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-2">
                    {/* 3D Book Effect */}
                    <div className="relative">
                        {/* Book Spine Shadow */}
                        <div className="absolute -left-1 top-2 bottom-2 w-4 bg-gradient-to-r from-black/30 to-transparent rounded-l-sm transform -skew-y-6 origin-left" />

                        {/* Book Cover */}
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl group-hover:shadow-2xl transition-shadow duration-500">
                            {/* Gradient Cover (placeholder for actual cover image) */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(book.id)} transition-all duration-500`} />

                            {/* Glassmorphism Overlay */}
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

                            {/* Book Title & Author */}
                            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                <h3 className="font-serif text-lg font-bold text-white leading-tight mb-1 line-clamp-2">
                                    {book.title}
                                </h3>
                                <p className="text-sm text-white/80 font-medium">
                                    {book.author}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            {progress > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 transform transition-all duration-300 hover:bg-white/30">
                                    Read Now
                                </span>
                            </div>
                        </div>

                        {/* 3D Page Edge Effect */}
                        <div className="absolute right-0 top-2 bottom-2 w-2 bg-gradient-to-l from-gray-200 to-gray-100 rounded-r-sm transform skew-y-3 origin-right opacity-80" />
                    </div>
                </div>

                {/* Genre Tag */}
                <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                        {book.genre}
                    </span>
                    {progress > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {progress}% complete
                        </span>
                    )}
                </div>
            </div>
        </Link>
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
    const index = parseInt(id) % gradients.length;
    return gradients[index];
}
