import { useMemo } from 'react';
import type { IntervalsContext, IntervalData } from '../types/llmTypes';

interface UseIntervalsContextProps {
    intervals: any[]; // Исходный массив интервалов из Redux
    filters?: any;
    pagination?: any;
}

export const useIntervalsContext = ({
                                        intervals,
                                        filters,
                                        pagination
                                    }: UseIntervalsContextProps): IntervalsContext => {
    return useMemo(() => {
        if (!intervals || intervals.length === 0) {
            return {
                count: 0,
                intervals: [],
                filters: undefined,
                metadata: {
                    currentPage: 1,
                    hasFilters: false,
                    totalPages: 1,
                    totalItems: 0
                }
            };
        }

        // Преобразуем интервалы в нужный формат
        const intervalData: IntervalData[] = intervals.map(interval => ({
            id: interval.id,
            title: interval.title,
            description: interval.description || 'Без описания',
            tone: interval.tone || 0,
            photo: interval.photo
        }));

        return {
            count: intervals.length,
            intervals: intervalData,
            filters: filters ? {
                title: filters.title,
                toneMin: filters.toneMin,
                toneMax: filters.toneMax
            } : undefined,
            metadata: {
                currentPage: pagination?.currentPage || 1,
                hasFilters: Boolean(filters?.title || filters?.toneMin || filters?.toneMax),
                totalPages: pagination?.totalPages || 1,
                totalItems: pagination?.totalItems || 0
            }
        };
    }, [intervals, filters, pagination]);
};