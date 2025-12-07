'use client';

import { useEffect, useRef, useState } from 'react';
import { getProgress, saveProgress } from '@/lib/bookStorage';

// We'll import ePub dynamically to avoid SSR issues
let ePub: typeof import('epubjs').default | null = null;

interface EpubReaderProps {
    bookId: string;
    bookData: ArrayBuffer;
    title: string;
    onBack: () => void;
}

export default function EpubReader({ bookId, bookData, title, onBack }: EpubReaderProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const renditionRef = useRef<import('epubjs').Rendition | null>(null);
    const bookRef = useRef<import('epubjs').Book | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<string>('');

    useEffect(() => {
        let mounted = true;

        const initReader = async () => {
            try {
                // Dynamically import epubjs
                if (!ePub) {
                    const module = await import('epubjs');
                    ePub = module.default;
                }

                if (!viewerRef.current || !mounted) return;

                console.log('Initializing EPUB reader with data size:', bookData.byteLength);

                // Create book from ArrayBuffer
                const book = ePub(bookData);
                bookRef.current = book;

                // Wait for book to be ready
                await book.ready;
                console.log('Book ready:', book.packaging.metadata);

                if (!mounted || !viewerRef.current) return;

                // Create rendition
                const rendition = book.renderTo(viewerRef.current, {
                    width: '100%',
                    height: '100%',
                    spread: 'none',
                    flow: 'scrolled-doc'
                });
                renditionRef.current = rendition;

                // Load saved progress
                const progress = await getProgress(bookId);
                const startLocation = progress?.epubLocation || undefined;

                // Display the book
                await rendition.display(startLocation);
                console.log('Book displayed');

                // Track location changes
                rendition.on('relocated', (location: import('epubjs').Location) => {
                    if (location.start?.cfi) {
                        setCurrentLocation(location.start.cfi);
                        // Save progress
                        saveProgress({
                            bookId,
                            currentChapter: 0,
                            scrollPosition: 0,
                            lastRead: new Date(),
                            percentComplete: Math.round((location.start.percentage || 0) * 100),
                            epubLocation: location.start.cfi,
                        }).catch(console.error);
                    }
                });

                setIsLoading(false);
            } catch (err) {
                console.error('Error initializing EPUB reader:', err);
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load book');
                    setIsLoading(false);
                }
            }
        };

        initReader();

        return () => {
            mounted = false;
            if (bookRef.current) {
                bookRef.current.destroy();
            }
        };
    }, [bookData, bookId]);

    const goNext = () => {
        renditionRef.current?.next();
    };

    const goPrev = () => {
        renditionRef.current?.prev();
    };

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: '#ef4444', marginBottom: '8px', fontWeight: 'bold' }}>Error Loading Book</p>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error}</p>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
            {/* Header */}
            <div style={{
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white',
                flexShrink: 0
            }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#6b7280',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '8px 12px',
                        borderRadius: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    ← Library
                </button>
                <h1 style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    {title}
                </h1>
                <div style={{ width: '100px' }} />
            </div>

            {/* Reader Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {isLoading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9fafb',
                        zIndex: 10
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                margin: '0 auto 16px',
                                borderRadius: '50%',
                                backgroundColor: '#fef3c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'pulse 2s ease-in-out infinite'
                            }}>
                                <span style={{ fontSize: '24px' }}>📖</span>
                            </div>
                            <p style={{ color: '#6b7280' }}>Loading book...</p>
                        </div>
                    </div>
                )}

                {/* EPUB Viewer Container */}
                <div
                    ref={viewerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        padding: '20px 40px',
                        boxSizing: 'border-box'
                    }}
                />

                {/* Navigation Buttons */}
                <button
                    onClick={goPrev}
                    style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#6b7280',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 5
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    ‹
                </button>
                <button
                    onClick={goNext}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#6b7280',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 5
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    ›
                </button>
            </div>

            <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}
