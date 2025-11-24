// import type { Interval, IntervalFilters } from '../types/interval'
// import { mockIntervals, DEFAULT_INTERVAL_IMAGE } from './mockData'
//
// const API_BASE = '/api'
//
// export const intervalsApi = {
//     getIntervals: async (filters?: IntervalFilters): Promise<Interval[]> => {
//         try {
//             const params = new URLSearchParams()
//             if (filters?.title) params.append('title', filters.title)
//             if (filters?.toneMin) params.append('tone_min', filters.toneMin.toString())
//             if (filters?.toneMax) params.append('tone_max', filters.toneMax.toString())
//
//             const response = await fetch(`${API_BASE}/intervals?${params}`)
//
//             if (!response.ok) throw new Error('API недоступен')
//
//             const data = await response.json()
//
//             console.log('Данные от бекенда:', data)
//
//             // Преобразуем данные от бекенда в наш формат
//             return data.map((item: any) => ({
//                 id: item.ID,
//                 title: item.Title,
//                 description: item.Description,
//                 tone: item.Tone,
//                 photo: item.Photo || DEFAULT_INTERVAL_IMAGE,
//                 isDelete: item.IsDelete || false
//             }))
//         } catch (error) {
//             console.warn('Используем mock данные:', error)
//
//             let filtered = mockIntervals.filter(interval => !interval.isDelete)
//
//             if (filters?.title) {
//                 filtered = filtered.filter(interval =>
//                     interval.title.toLowerCase().includes(filters.title!.toLowerCase())
//                 )
//             }
//
//             if (filters?.toneMin) {
//                 filtered = filtered.filter(interval => interval.tone >= filters.toneMin!)
//             }
//
//             if (filters?.toneMax) {
//                 filtered = filtered.filter(interval => interval.tone <= filters.toneMax!)
//             }
//
//             return filtered
//         }
//     },
//
//     getInterval: async (id: number): Promise<Interval> => {
//         try {
//             const response = await fetch(`${API_BASE}/intervals/${id}`)
//
//             if (!response.ok) throw new Error('API недоступен')
//
//             const item = await response.json()
//
//             return {
//                 id: item.ID,
//                 title: item.Title,
//                 description: item.Description,
//                 tone: item.Tone,
//                 photo: item.Photo || DEFAULT_INTERVAL_IMAGE,
//                 isDelete: item.IsDelete || false
//             }
//         } catch (error) {
//             console.warn('Используем mock данные')
//             const interval = mockIntervals.find(i => i.id === id && !i.isDelete)
//             if (!interval) throw new Error('Интервал не найден')
//
//             return interval
//         }
//     }
// }
//
// export { DEFAULT_INTERVAL_IMAGE }