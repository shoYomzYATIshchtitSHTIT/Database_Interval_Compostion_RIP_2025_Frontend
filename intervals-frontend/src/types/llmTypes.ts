export type ChatMessage = {
    role: 'user' | 'system' | 'assistant';
    content: string;
};

export interface IntervalsContext {
    count: number;
    titles: string[];
    tones: number[];
    filters?: {
        title?: string;
        toneMin?: number;
        toneMax?: number;
    };
    metadata?: {
        currentPage: number;
        hasFilters: boolean;
    };
}

export interface AssistantConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}