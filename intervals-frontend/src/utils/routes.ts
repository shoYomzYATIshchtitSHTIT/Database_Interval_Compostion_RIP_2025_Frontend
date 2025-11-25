export const ROUTES = {
    HOME: '/',
    INTERVALS: '/intervals',
    INTERVAL_DETAIL: '/intervals/:id',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    COMPOSITIONS: '/compositions',
    COMPOSITION_DETAIL: '/compositions/:id',
}

export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
    HOME: 'Главная',
    INTERVALS: 'Интервалы',
    INTERVAL_DETAIL: 'Детали интервала',
    LOGIN: 'Вход',
    REGISTER: 'Регистрация',
    PROFILE: 'Профиль',
    COMPOSITIONS: 'Мои композиции',
    COMPOSITION_DETAIL: 'Детали композиции',
}