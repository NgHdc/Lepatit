import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { LocalBook, ReadingProgress } from '@/types/book';

interface BookStoreDB extends DBSchema {
    books: {
        key: string;
        value: LocalBook;
        indexes: { 'by-title': string };
    };
    progress: {
        key: string;
        value: ReadingProgress;
    };
}

const DB_NAME = 'lepatit-reader';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<BookStoreDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<BookStoreDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Books store
                if (!db.objectStoreNames.contains('books')) {
                    const bookStore = db.createObjectStore('books', { keyPath: 'id' });
                    bookStore.createIndex('by-title', 'title');
                }
                // Progress store
                if (!db.objectStoreNames.contains('progress')) {
                    db.createObjectStore('progress', { keyPath: 'bookId' });
                }
            },
        });
    }
    return dbPromise;
}

// Book operations
export async function saveBook(book: LocalBook): Promise<void> {
    const db = await getDB();
    await db.put('books', book);
}

export async function getBook(id: string): Promise<LocalBook | undefined> {
    const db = await getDB();
    return db.get('books', id);
}

export async function getAllBooks(): Promise<LocalBook[]> {
    const db = await getDB();
    return db.getAll('books');
}

export async function deleteBook(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('books', id);
    // Also delete progress
    await db.delete('progress', id);
}

// Progress operations
export async function saveProgress(progress: ReadingProgress): Promise<void> {
    const db = await getDB();
    await db.put('progress', progress);
}

export async function getProgress(bookId: string): Promise<ReadingProgress | undefined> {
    const db = await getDB();
    return db.get('progress', bookId);
}

export async function getAllProgress(): Promise<ReadingProgress[]> {
    const db = await getDB();
    return db.getAll('progress');
}

// Utility to generate unique ID
export function generateBookId(): string {
    return `book_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Extract metadata from EPUB file (basic extraction)
export async function extractEpubMetadata(file: File): Promise<{ title: string; author: string }> {
    // For now, we'll use the filename as title
    // In a full implementation, you'd parse the OPF file inside the EPUB
    const fileName = file.name.replace(/\.epub$/i, '');
    return {
        title: fileName,
        author: 'Unknown Author',
    };
}
