export interface User {
    id?: number;
    login?: string;
    is_moderator?: boolean;
}

export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_at: string;
    user_id: number;
    login: string;
    is_moderator: boolean;
}

export interface Composition {
    id: number;
    status: string;
    creator_id: number;
    moderator_id?: number;
    date_create: string;
    date_update: string;
    date_finish?: string;
    belonging?: string;
    title?: string;
    intervals?: CompositionInterval[];
}

export interface CompositionInterval {
    interval_id: number;
    title: string;
    amount: number;
}

export interface Interval {
    id: number
    title: string
    description: string
    tone: number
    photo?: string
    isDelete: boolean
}

export interface IntervalFilters {
    title?: string
    toneMin?: number
    toneMax?: number
}
