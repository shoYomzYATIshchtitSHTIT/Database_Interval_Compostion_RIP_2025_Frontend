export type ChatMessage = {
    role: 'user' | 'system' | 'assistant';
    content: string;
};

export interface IntervalData {
    id: number;
    title: string;
    description: string;
    tone: number;
    photo?: string;
}

export interface IntervalsContext {
    count: number;
    intervals: IntervalData[]; // Добавляем полные данные интервалов
    filters?: {
        title?: string;
        toneMin?: number;
        toneMax?: number;
    };
    metadata?: {
        currentPage: number;
        hasFilters: boolean;
        totalPages: number;
        totalItems: number;
    };
}