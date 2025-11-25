import { configureStore } from '@reduxjs/toolkit'
import filtersReducer from './slices/filtersSlice'
import authReducer, { resetAuth } from './slices/authSlice'
import compositionsReducer from './slices/compositionsSlice'
import intervalsReducer from './slices/intervalsSlice'

const store = configureStore({
    reducer: {
        filters: filtersReducer,
        auth: authReducer,
        compositions: compositionsReducer,
        intervals: intervalsReducer
    },
    devTools: import.meta.env.DEV
})

// Сбрасываем пользователя на гостя при инициализации (например, после F5)
store.dispatch(resetAuth())

// Экспортируем типы
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export { store }
