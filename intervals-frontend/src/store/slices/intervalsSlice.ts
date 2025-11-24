import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: IntervalsState = {
    intervals: [],
    currentInterval: null,
    loading: false,
    error: null,
    filters: {},
};

// Функция для преобразования данных от бекенда
const transformBackendInterval = (backendItem: any) => ({
    id: backendItem.ID || backendItem.id || 0,
    title: backendItem.Title || backendItem.title || 'Без названия',
    description: backendItem.Description || backendItem.description || 'Описание отсутствует',
    tone: backendItem.Tone || backendItem.tone || 0,
    photo: backendItem.Photo || backendItem.photo || '',
    isDelete: backendItem.IsDelete || backendItem.isDelete || false
});

export const getIntervals = createAsyncThunk(
    'intervals/getIntervals',
    async (filters: { title?: string; tone_min?: number; tone_max?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.intervals.intervalsList(filters);

            // Преобразуем данные от бекенда
            const transformedData = Array.isArray(response.data)
                ? response.data.map(transformBackendInterval)
                : [];

            return transformedData;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.error || 'Ошибка загрузки интервалов'
            );
        }
    }
);

export const getIntervalDetail = createAsyncThunk(
    'intervals/getIntervalDetail',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.intervals.intervalsDetail({ id });
            return transformBackendInterval(response.data);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.error || 'Ошибка загрузки интервала'
            );
        }
    }
);

export const intervalsSlice = createSlice({
    name: 'intervals',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setFilters: (state, action: PayloadAction<{ title?: string; toneMin?: number; toneMax?: number }>) => {
            state.filters = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getIntervals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getIntervals.fulfilled, (state, action) => {
                state.loading = false;
                state.intervals = action.payload;
            })
            .addCase(getIntervals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getIntervalDetail.fulfilled, (state, action) => {
                state.currentInterval = action.payload;
            })
            .addCase(getIntervalDetail.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError, setFilters } = intervalsSlice.actions;
export default intervalsSlice.reducer;