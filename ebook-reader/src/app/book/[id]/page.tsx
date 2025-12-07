import Link from 'next/link';
import { getBookById, sampleBooks } from '@/data/books';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    return sampleBooks.map((book) => ({
        id: book.id,
    }));
}

export default async function BookPage({ params }: PageProps) {
    const { id } = await params;
    const book = getBookById(id);

    if (!book) {
        notFound();
    }

    const gradients = [
        'from-violet-600 via-purple-600 to-indigo-700',
        'from-rose-600 via-pink-600 to-fuchsia-700',
        'from-amber-500 via-orange-500 to-red-600',
        'from-emerald-500 via-teal-500 to-cyan-600',
        'from-blue-600 via-indigo-600 to-violet-700',
        'from-slate-600 via-gray-700 to-zinc-800',
    ];
    const gradient = gradients[parseInt(book.id) % gradients.length];

    return (
        <div className="min-h-screen">
            {/* Hero / Book Info */}
            <section className="relative overflow-hidden">
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-950/50 dark:to-gray-950" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Library
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                        {/* Book Cover */}
                        <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
                            <div className="relative">
                                {/* 3D Effect */}
                                <div className="absolute -left-2 top-4 bottom-4 w-4 bg-gradient-to-r from-black/20 to-transparent rounded-l-sm" />
                                <div className={`aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br ${gradient}`}>
                                    {/* Decorative Pattern */}
                                    <div className="absolute inset-0 opacity-30">
                                        <div className="absolute top-8 left-8 right-8 h-px bg-white/50" />
                                        <div className="absolute bottom-1/3 left-8 right-8 h-px bg-white/30" />
                                    </div>
                                    {/* Title */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                                        <h1 className="text-xl font-serif font-bold text-white leading-tight mb-2">
                                            {book.title}
                                        </h1>
                                        <p className="text-sm text-white/80">{book.author}</p>
                                    </div>
                                </div>
                                <div className="absolute right-0 top-4 bottom-4 w-3 bg-gradient-to-l from-gray-300 to-gray-100 rounded-r-sm" />
                            </div>
                        </div>

                        {/* Book Details */}
                        <div className="flex-1">
                            <div className="mb-4">
                                <span className="px-3 py-1 text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                    {book.genre}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                                {book.title}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                                by {book.author}
                            </p>

                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                                {book.description}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 mb-8">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{book.publishedYear}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Pages</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{book.pages}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Chapters</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{book.chapters.length}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={`/reader/${book.id}`}
                                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Start Reading
                                </Link>
                                <button className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Add to List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chapters Section */}
            <section className="py-12 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Table of Contents
                    </h2>
                    <div className="space-y-2">
                        {book.chapters.map((chapter, index) => (
                            <Link
                                key={chapter.id}
                                href={`/reader/${book.id}?chapter=${index}`}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/30 dark:group-hover:text-amber-400 transition-colors">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {chapter.title}
                                    </span>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
