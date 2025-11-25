import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { HandlerLoginRequest, HandlerRegisterRequest, DsUsers, HandlerUpdateProfileRequest } from '../../api/Api';

interface AuthState {
    user: DsUsers | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// ================== Async Thunks ==================

// Login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: HandlerLoginRequest, { rejectWithValue }) => {
        try {
            const response = await api.users.loginCreate(credentials);
            const data = response.data;

            // Сохраняем токены в localStorage
            if (data.access_token) localStorage.setItem('accessToken', data.access_token);
            if (data.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);

            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка авторизации');
        }
    }
);

// Register
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: HandlerRegisterRequest, { rejectWithValue }) => {
        try {
            const response = await api.users.registerCreate(userData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка регистрации');
        }
    }
);

// Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await api.users.logoutCreate();
            return null;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка выхода');
        }
    }
);

// Get profile
export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.users.profileList();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки профиля');
        }
    }
);

// Update profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (updates: HandlerUpdateProfileRequest, { rejectWithValue }) => {
        try {
            const response = await api.users.profileUpdate(updates);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка обновления профиля');
        }
    }
);

// ================== Slice ==================

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<DsUsers>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        resetAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        // Проверка токена при F5
        checkAuth: (state) => {
            const token = localStorage.getItem('accessToken');
            state.isAuthenticated = !!token;
            if (!token) state.user = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = {
                    id: action.payload.user_id,
                    login: action.payload.login,
                    is_moderator: action.payload.is_moderator
                };
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            })
            .addCase(logoutUser.rejected, (state) => {
                // Даже если logout не прошел, делаем пользователя гостем
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            })

            // Get profile
            .addCase(getProfile.fulfilled, (state, action) => {
                const data = Array.isArray(action.payload) ? action.payload[0] : action.payload;
                if (data) {
                    state.user = {
                        id: data.id,
                        login: data.login,
                        is_moderator: data.is_moderator
                    };
                    state.isAuthenticated = true;
                }
            })

            // Update profile
            .addCase(updateProfile.fulfilled, (state, action) => {
                if (state.user) {
                    state.user = { ...state.user, ...action.payload };
                }
            });
    },
});

export const { clearError, setUser, resetAuth, checkAuth } = authSlice.actions;
export default authSlice.reducer;
