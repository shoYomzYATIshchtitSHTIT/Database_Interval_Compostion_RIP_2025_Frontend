import { configureStore } from '@reduxjs/toolkit'
import filtersReducer from './slices/filtersSlice'
import authReducer from './slices/authSlice'
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

// Экспортируем типы правильно
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Экспортируем сам store
export { store }