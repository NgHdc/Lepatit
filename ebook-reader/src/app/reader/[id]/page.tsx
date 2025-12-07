'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getBook } from '@/lib/bookStorage';
import { getBookById } from '@/data/books';

// Dynamic import of EpubReader for client-side only
const EpubReader = dynamic(
    () => import('@/components/EpubReader'),
    { ssr: false }
);

// Dynamic import for sample book reader
const SampleBookReader = dynamic(
    () => import('./SampleBookReader'),
    { ssr: false }
);

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ReaderPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [bookType, setBookType] = useState<'sample' | 'local' | 'loading' | 'error'>('loading');
    const [bookData, setBookData] = useState<ArrayBuffer | null>(null);
    const [bookTitle, setBookTitle] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const loadBook = async () => {
            console.log('Loading book with id:', id);

            try {
                // Check if it's a local book (starts with book_)
                if (id.startsWith('book_')) {
                    console.log('Attempting to load local book...');
                    const localBook = await getBook(id);
                    console.log('Local book result:', localBook ? 'Found' : 'Not found', localBook);

                    if (localBook && localBook.fileData) {
                        console.log('Book data size:', localBook.fileData.byteLength);
                        setBookData(localBook.fileData);
                        setBookTitle(localBook.title);
                        setBookType('local');
                        return;
                    } else {
                        console.log('Local book not found or no file data');
                    }
                }

                // Check if it's a sample book (numeric id like "1", "2", etc.)
                const sampleBook = getBookById(id);
                console.log('Sample book result:', sampleBook ? sampleBook.title : 'Not found');

                if (sampleBook) {
                    setBookTitle(sampleBook.title);
                    setBookType('sample');
                    return;
                }

                // Book not found
                console.log('No book found with id:', id);
                setErrorMessage('Book not found');
                setBookType('error');
            } catch (err) {
                console.error('Error loading book:', err);
                setErrorMessage('Failed to load book: ' + (err instanceof Error ? err.message : String(err)));
                setBookType('error');
            }
        };

        loadBook();
    }, [id]);

    if (bookType === 'loading') {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 16px',
                        borderRadius: '50%',
                        backgroundColor: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ fontSize: '24px' }}>📖</span>
                    </div>
                    <p style={{ color: '#6b7280' }}>Loading book...</p>
                </div>
            </div>
        );
    }

    if (bookType === 'error') {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
                    <p style={{ color: '#ef4444', marginBottom: '8px', fontWeight: 'bold' }}>Error</p>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>{errorMessage}</p>
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '16px' }}>Book ID: {id}</p>
                    <button
                        onClick={() => router.push('/')}
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

    if (bookType === 'local' && bookData) {
        return (
            <EpubReader
                bookId={id}
                bookData={bookData}
                title={bookTitle}
                onBack={() => router.push('/')}
            />
        );
    }

    // Sample book reader
    return <SampleBookReader bookId={id} />;
}
