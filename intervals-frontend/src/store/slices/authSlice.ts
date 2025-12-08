import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { HandlerLoginRequest, HandlerRegisterRequest, DsUsers } from '../../api';

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

// ------------------- THUNKS -------------------

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: HandlerLoginRequest, { rejectWithValue }) => {
        console.log('[AUTH] loginUser called', credentials);
        try {
            const response = await api.users.loginCreate(credentials);
            const data = response.data;

            if (data.access_token) {
                localStorage.setItem('accessToken', data.access_token);
                console.log('[AUTH] accessToken saved', data.access_token);
            }
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
                console.log('[AUTH] refreshToken saved', data.refresh_token);
            }

            return data;
        } catch (error: any) {
            console.error('[AUTH] loginUser error', error);
            return rejectWithValue(
                error.response?.data?.error || 'Ошибка авторизации'
            );
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: HandlerRegisterRequest, { rejectWithValue }) => {
        console.log('[AUTH] registerUser called', userData);
        try {
            const response = await api.users.registerCreate(userData);
            return response.data;
        } catch (error: any) {
            console.error('[AUTH] registerUser error', error);
            return rejectWithValue(
                error.response?.data?.error || 'Ошибка регистрации'
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        console.log('[AUTH] logoutUser called');
        try {
            await api.users.logoutCreate();
            return null;
        } catch (error: any) {
            console.error('[AUTH] logoutUser error', error);
            return rejectWithValue(
                error.response?.data?.error || 'Ошибка выхода'
            );
        }
    }
);

export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        console.log('[AUTH] getProfile called');
        try {
            const response = await api.users.profileList();
            console.log('[AUTH] getProfile response', response.data);
            return response.data;
        } catch (error: any) {
            console.error('[AUTH] getProfile error', error);
            return rejectWithValue(
                error.response?.data?.error || 'Ошибка загрузки профиля'
            );
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (updates: any, { rejectWithValue }) => {
        console.log('[AUTH] updateProfile called', updates);
        try {
            const response = await api.users.profileUpdate(updates);
            return response.data;
        } catch (error: any) {
            console.error('[AUTH] updateProfile error', error);
            return rejectWithValue(
                error.response?.data?.error || 'Ошибка обновления профиля'
            );
        }
    }
);

// ------------------- SLICE -------------------

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            console.log('[AUTH] clearError called');
            state.error = null;
        },
        setUser: (state, action: PayloadAction<DsUsers>) => {
            console.log('[AUTH] setUser', action.payload);
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        checkAuth: (state) => {
            const token = localStorage.getItem('accessToken');
            state.isAuthenticated = !!token;
            console.log('[AUTH] checkAuth, token exists:', !!token);
        },
        resetAuth(state) {
            state.user = null;
            state.isAuthenticated = false;

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
    },
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(loginUser.pending, (state) => {
                console.log('[AUTH] loginUser pending');
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                console.log('[AUTH] loginUser fulfilled', action.payload);
                state.loading = false;
                state.isAuthenticated = true;
                state.user = {
                    id: action.payload.user_id,
                    login: action.payload.login,
                    is_moderator: action.payload.is_moderator
                };
            })
            .addCase(loginUser.rejected, (state, action) => {
                console.log('[AUTH] loginUser rejected', action.payload);
                state.loading = false;
                state.error = action.payload as string;
            })

            // REGISTER
            .addCase(registerUser.pending, (state) => {
                console.log('[AUTH] registerUser pending');
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                console.log('[AUTH] registerUser fulfilled');
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                console.log('[AUTH] registerUser rejected', action.payload);
                state.loading = false;
                state.error = action.payload as string;
            })

            // LOGOUT
            .addCase(logoutUser.fulfilled, (state) => {
                console.log('[AUTH] logoutUser fulfilled');
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                console.log('[AUTH] tokens removed');
            })
            .addCase(logoutUser.rejected, (state, action) => {
                console.log('[AUTH] logoutUser rejected', action.payload);
                state.error = action.payload as string;
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                console.log('[AUTH] tokens removed');
            })

            // GET PROFILE
            .addCase(getProfile.fulfilled, (state, action) => {
                console.log('[AUTH] getProfile fulfilled', action.payload);
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

            // UPDATE PROFILE
            .addCase(updateProfile.fulfilled, (state, action) => {
                console.log('[AUTH] updateProfile fulfilled', action.payload);
                if (state.user) {
                    state.user = { ...state.user, ...action.payload };
                }
            });
    },
});

export const {resetAuth,  clearError, setUser, checkAuth } = authSlice.actions;
export default authSlice.reducer;
