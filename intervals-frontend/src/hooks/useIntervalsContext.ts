import { useMemo } from 'react';
import type { IntervalsContext } from '../types/llmTypes';

interface UseIntervalsContextProps {
    intervals: any[];
    filters?: any;
    currentPage?: number;
}

export const useIntervalsContext = ({
                                        intervals,
                                        filters,
                                        currentPage = 1
                                    }: UseIntervalsContextProps): IntervalsContext => {
    return useMemo(() => {
        if (!intervals || intervals.length === 0) {
            return {
                count: 0,
                titles: [],
                tones: [],
                filters: undefined
            };
        }

        return {
            count: intervals.length,
            titles: intervals.map(i => i.title),
            tones: intervals.map(i => i.tone),
            filters: filters ? {
                title: filters.title,
                toneMin: filters.toneMin,
                toneMax: filters.toneMax
            } : undefined,
            metadata: {
                currentPage,
                hasFilters: Boolean(filters?.title || filters?.toneMin || filters?.toneMax)
            }
        };
    }, [intervals, filters, currentPage]);
};