// Book types for both sample and uploaded books

export interface Book {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    description: string;
    genre: string;
    publishedYear: number;
    pages: number;
    chapters: Chapter[];
    // New fields for uploaded books
    isLocal?: boolean;
    fileSize?: number;
    addedAt?: Date;
}

export interface LocalBook {
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
    fileName: string;
    fileSize: number;
    fileData: ArrayBuffer;
    addedAt: Date;
}

export interface Chapter {
    id: string;
    title: string;
    content: string;
}

export interface ReadingProgress {
    bookId: string;
    currentChapter: number;
    scrollPosition: number;
    lastRead: Date;
    percentComplete: number;
    // For EPUB files
    epubLocation?: string;
}
