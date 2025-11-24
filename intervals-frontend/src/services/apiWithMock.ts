import { api } from '../api'
import type { Interval } from '../types/interval'

// Дефолтное изображение через BASE_URL
export const DEFAULT_INTERVAL_IMAGE = import.meta.env.BASE_URL + 'img/default_interval.png'

export const mockIntervals: Interval[] = [
    {
        id: 1,
        title: "Прима",
        description: "Основной интервал в музыке, соответствует одному и тому же звуку",
        tone: 1.0,
        photo: DEFAULT_INTERVAL_IMAGE,
        isDelete: false
    },
    {
        id: 2,
        title: "Секунда",
        description: "Второй интервал в музыкальной гамме, малая или большая",
        tone: 2.0,
        photo: DEFAULT_INTERVAL_IMAGE,
        isDelete: false
    }
]

// Функция для преобразования данных от бекенда в наш формат
const transformBackendInterval = (backendItem: any): Interval => ({
    id: backendItem.ID || backendItem.id || 0,
    title: backendItem.Title || backendItem.title || 'Без названия',
    description: backendItem.Description || backendItem.description || 'Описание отсутствует',
    tone: backendItem.Tone || backendItem.tone || 0,
    photo: backendItem.Photo || backendItem.photo || DEFAULT_INTERVAL_IMAGE,
    isDelete: backendItem.IsDelete || backendItem.isDelete || false
})

// Новый API сервис с поддержкой mock данных
export const intervalsApiWithMock = {
    getIntervals: async (filters?: { title?: string; toneMin?: number; toneMax?: number }): Promise<Interval[]> => {
        try {
            const response = await api.intervals.intervalsList({
                title: filters?.title,
                tone_min: filters?.toneMin,
                tone_max: filters?.toneMax
            })

            console.log('Данные от бекенда:', response.data)

            // Преобразуем данные от бекенда в наш формат
            if (Array.isArray(response.data)) {
                return response.data.map(transformBackendInterval)
            }

            return []
        } catch (error) {
            console.warn('Используем mock данные:', error)

            let filtered = mockIntervals.filter(interval => !interval.isDelete)

            if (filters?.title) {
                filtered = filtered.filter(interval =>
                    interval.title.toLowerCase().includes(filters.title!.toLowerCase())
                )
            }

            if (filters?.toneMin) {
                filtered = filtered.filter(interval => interval.tone >= filters.toneMin!)
            }

            if (filters?.toneMax) {
                filtered = filtered.filter(interval => interval.tone <= filters.toneMax!)
            }

            return filtered
        }
    },

    getInterval: async (id: number): Promise<Interval> => {
        try {
            const response = await api.intervals.intervalsDetail({ id })
            console.log('Данные интервала от бекенда:', response.data)
            return transformBackendInterval(response.data)
        } catch (error) {
            console.warn('Используем mock данные:', error)
            const interval = mockIntervals.find(i => i.id === id && !i.isDelete)
            if (!interval) throw new Error('Интервал не найден')

            return interval
        }
    }
}

