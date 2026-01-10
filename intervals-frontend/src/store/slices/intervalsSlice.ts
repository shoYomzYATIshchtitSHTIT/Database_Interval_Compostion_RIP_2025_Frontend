import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api';

interface IntervalsState {
    intervals: any[];
    currentInterval: any | null;
    loading: boolean;
    error: string | null;
    filters: {
        title?: string;
        toneMin?: number;
        toneMax?: number;
    };
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

const initialState: IntervalsState = {
    intervals: [],
    currentInterval: null,
    loading: false,
    error: null,
    filters: {},
    pagination: {
        currentPage: 1,
        pageSize: 8,
        totalItems: 0,
        totalPages: 1,
    },
};

export const getIntervals = createAsyncThunk(
    'intervals/getIntervals',
    async (
        params: {
            filters?: {
                title?: string;
                tone_min?: number;
                tone_max?: number
            };
            page?: number;
            pageSize?: number;
        } = {},
        { rejectWithValue }
    ) => {
        try {
            const { filters = {}, page = 1, pageSize = 8 } = params;

            console.log('[API] Серверная пагинация:', {
                filters,
                page,
                pageSize
            });

            // Сервер вернет ТОЛЬКО 8 записей и информацию о пагинации
            const response = await api.intervals.intervalsList({
                title: filters.title,
                tone_min: filters.tone_min,
                tone_max: filters.tone_max,
                page: page,
                page_size: pageSize
            });

            // response.data теперь содержит DsPaginatedIntervalsResponse
            const apiResponse = response.data;

            // Преобразуем данные от бекенда
            const intervals = Array.isArray(apiResponse.data)
                ? apiResponse.data.map((item: any) => ({
                    id: item.ID || item.id || 0,
                    title: item.Title || item.title || 'Без названия',
                    description: item.Description || item.description || 'Описание отсутствует',
                    tone: item.Tone || item.tone || 0,
                    photo: item.Photo || item.photo || '',
                    isDelete: item.IsDelete || item.isDelete || false
                }))
                : [];

            return {
                intervals: intervals,
                currentPage: apiResponse.pagination?.page || page,
                pageSize: apiResponse.pagination?.page_size || pageSize,
                totalItems: apiResponse.pagination?.total || 0,
                totalPages: apiResponse.pagination?.total_pages || 1,
                stats: apiResponse.stats // Для отладки
            };
        } catch (error: any) {
            console.error('[API] Ошибка загрузки интервалов:', error);
            return rejectWithValue(
                error.response?.data?.error || 'Ошибка загрузки интервалов'
            );
        }
    }
);

export const intervalsSlice = createSlice({
    name: 'intervals',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.pagination.currentPage = action.payload;
        },
        setFilters: (state, action: PayloadAction<{
            title?: string;
            toneMin?: number;
            toneMax?: number
        }>) => {
            state.filters = action.payload;
            state.pagination.currentPage = 1; // Сброс на первую страницу
        },
        clearAll: (state) => {
            state.intervals = [];
            state.pagination = initialState.pagination;
            state.filters = {};
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getIntervals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getIntervals.fulfilled, (state, action) => {
                state.loading = false;
                state.intervals = action.payload.intervals;
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    pageSize: action.payload.pageSize,
                    totalItems: action.payload.totalItems,
                    totalPages: action.payload.totalPages,
                };

                // Логируем статистику (для отладки индексов)
                if (action.payload.stats) {
                    console.log('[REDUX] Статистика запроса:', action.payload.stats);
                }
            })
            .addCase(getIntervals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setPage, setFilters, clearAll } = intervalsSlice.actions;
export default intervalsSlice.reducer;