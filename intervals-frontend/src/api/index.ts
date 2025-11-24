import { Api, HttpClient, type DsInterval, type DsUsers,
    type HandlerAddIntervalToCompositionRequest, type HandlerCartInfoResponse, type HandlerLoginRequest, type HandlerRegisterRequest } from './Api';

export const api = new Api(
    new HttpClient({
        baseURL: '/api',
    })
);


// Добавляем интерцептор для JWT токена
api.http.instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор для обработки ошибок
api.http.instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // TODO: Добавить логику обновления токена
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Экспортируем типы для использования в компонентах
export type {
    DsInterval,
    DsUsers,
    HandlerCartInfoResponse,
    HandlerLoginRequest,
    HandlerRegisterRequest,
    HandlerAddIntervalToCompositionRequest
};