import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api';
import type {
    HandlerAddIntervalToCompositionRequest,
    HandlerRemoveFromCompositionRequest,
    HandlerUpdateCompositionIntervalRequest,
    HandlerUpdateCompositionRequest,
} from '../../api/Api';

export interface CompositionInterval {
    interval_id: number;
    amount: number;
    title?: string;
    description?: string;
    tone?: number;
    photo?: string;
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

interface CompositionsState {
    compositions: Composition[];
    currentComposition: Composition | null;
    cart: {
        compositionId: number | null;
        itemCount: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: CompositionsState = {
    compositions: [],
    currentComposition: null,
    cart: {
        compositionId: null,
        itemCount: 0,
    },
    loading: false,
    error: null,
};

// ================== Async Thunks ==================

export const getCompositions = createAsyncThunk(
    'compositions/getCompositions',
    async (filters: { status?: string; date_from?: string; date_to?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await api.compositions.compositionsList(filters);
            return response.data as Composition[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки заявок');
        }
    }
);

export const getCompositionDetail = createAsyncThunk(
    'compositions/getCompositionDetail',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.compositions.compositionsDetail({ id });
            const data = response.data;

            const composition: Composition = {
                id: data.id,
                status: data.status,
                creator_id: data.creator_id,
                date_create: data.date_create,
                date_update: data.date_update,
                moderator_id: data.moderator_id,
                date_finish: data.date_finish,
                belonging: data.belonging,
                title: data.title,
                intervals: data.intervals?.map((interval: any) => ({
                    interval_id: interval.id ?? interval.interval_id,
                    amount: interval.amount ?? 1,
                    title: interval.title ?? interval.Interval?.Title,
                    description: interval.description ?? interval.Interval?.Description,
                    tone: interval.tone ?? interval.Interval?.Tone,
                    photo: interval.photo ?? interval.Interval?.Photo,
                })),
            };

            return composition;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки заявки');
        }
    }
);

export const getCompositionCart = createAsyncThunk(
    'compositions/getCompositionCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.compositions.compCartList();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки корзины');
        }
    }
);

export const addIntervalToComposition = createAsyncThunk(
    'compositions/addInterval',
    async (data: HandlerAddIntervalToCompositionRequest, { rejectWithValue }) => {
        try {
            await api.intervals.addToCompositionCreate(data);
            const cartResponse = await api.compositions.compCartList();
            return cartResponse.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка добавления интервала');
        }
    }
);

export const removeIntervalFromComposition = createAsyncThunk(
    'compositions/removeInterval',
    async (data: HandlerRemoveFromCompositionRequest, { rejectWithValue }) => {
        try {
            await api.compositionIntervals.compositionIntervalsDelete(data);
            const cartResponse = await api.compositions.compCartList();
            return { cart: cartResponse.data, removedIntervalId: data.interval_id };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка удаления интервала');
        }
    }
);

export const updateIntervalAmount = createAsyncThunk(
    'compositions/updateIntervalAmount',
    async (data: HandlerUpdateCompositionIntervalRequest, { rejectWithValue }) => {
        try {
            await api.compositionIntervals.compositionIntervalsUpdate(data);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка обновления количества');
        }
    }
);

export const updateCompositionFields = createAsyncThunk(
    'compositions/updateCompositionFields',
    async ({ id, updates }: { id: number; updates: HandlerUpdateCompositionRequest }, { rejectWithValue }) => {
        try {
            await api.compositions.compositionsUpdate({ id }, updates);
            return { id, updates };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка обновления полей заявки');
        }
    }
);

export const formComposition = createAsyncThunk(
    'compositions/formComposition',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.compositions.formUpdate({ id });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка формирования заявки');
        }
    }
);

export const deleteComposition = createAsyncThunk(
    'compositions/deleteComposition',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.compositions.compositionsDelete({ id });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка удаления заявки');
        }
    }
);

export const completeComposition = createAsyncThunk(
    'compositions/completeComposition',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.compositions.completeUpdate({ id });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка завершения заявки');
        }
    }
);

export const rejectComposition = createAsyncThunk(
    'compositions/rejectComposition',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.compositions.rejectUpdate({ id });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка отклонения заявки');
        }
    }
);

// ================== Slice ==================

export const compositionsSlice = createSlice({
    name: 'compositions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentComposition: (state) => {
            state.currentComposition = null;
        },
        updateCartLocal: (state, action: PayloadAction<{ compositionId: number | null; itemCount: number }>) => {
            state.cart = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Compositions
            .addCase(getCompositions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCompositions.fulfilled, (state, action) => {
                state.loading = false;
                state.compositions = action.payload;
            })
            .addCase(getCompositions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Composition Detail
            .addCase(getCompositionDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCompositionDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.currentComposition = action.payload;
            })
            .addCase(getCompositionDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Composition Cart
            .addCase(getCompositionCart.fulfilled, (state, action) => {
                state.cart = {
                    compositionId: action.payload.composition_id ?? null,
                    itemCount: action.payload.item_count ?? 0,
                };
            })

            // Add Interval
            .addCase(addIntervalToComposition.fulfilled, (state, action) => {
                state.cart = {
                    compositionId: action.payload.composition_id ?? null,
                    itemCount: action.payload.item_count ?? 0,
                };
            })
            .addCase(addIntervalToComposition.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Remove Interval
            .addCase(removeIntervalFromComposition.fulfilled, (state, action) => {
                state.cart = {
                    compositionId: action.payload.cart.composition_id ?? null,
                    itemCount: action.payload.cart.item_count ?? 0,
                };
                if (state.currentComposition?.intervals) {
                    state.currentComposition.intervals = state.currentComposition.intervals.filter(
                        interval => interval.interval_id !== action.payload.removedIntervalId
                    );
                }
            })

            // Update Interval Amount
            .addCase(updateIntervalAmount.fulfilled, (state, action) => {
                if (state.currentComposition?.intervals) {
                    const interval = state.currentComposition.intervals.find(
                        i => i.interval_id === action.payload.interval_id
                    );
                    if (interval) {
                        interval.amount = action.payload.amount;
                    }
                }
            })

            // Update Composition Fields
            .addCase(updateCompositionFields.fulfilled, (state, action) => {
                if (state.currentComposition && state.currentComposition.id === action.payload.id) {
                    state.currentComposition = { ...state.currentComposition, ...action.payload.updates };
                }

                // Также обновляем в общем списке
                const index = state.compositions.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.compositions[index] = {
                        ...state.compositions[index],
                        ...action.payload.updates
                    };
                }
            })

            // Form Composition
            .addCase(formComposition.fulfilled, (state, action) => {
                const comp = state.compositions.find(c => c.id === action.payload);
                if (comp) comp.status = 'Сформирована';
                state.cart = { compositionId: null, itemCount: 0 };
            })

            // Delete Composition
            .addCase(deleteComposition.fulfilled, (state, action) => {
                state.compositions = state.compositions.filter(c => c.id !== action.payload);
            })

            // Complete Composition
            .addCase(completeComposition.fulfilled, (state, action) => {
                const comp = state.compositions.find(c => c.id === action.payload);
                if (comp) {
                    comp.status = 'Завершена';
                    comp.belonging = ''; // Очищаем, Django заполнит позже
                }
            })
            .addCase(completeComposition.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Reject Composition
            .addCase(rejectComposition.fulfilled, (state, action) => {
                const comp = state.compositions.find(c => c.id === action.payload);
                if (comp) comp.status = 'Отклонена';
            })
            .addCase(rejectComposition.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearCurrentComposition, updateCartLocal } = compositionsSlice.actions;
export default compositionsSlice.reducer;