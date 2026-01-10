import { useState, useEffect } from 'react';
import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import type { InitProgressReport } from '@mlc-ai/web-llm';

const useWebLLM = (model: string = 'Llama-3.2-1B-Instruct-q4f16_1-MLC') => {
    const [engine, setEngine] = useState<MLCEngine | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initEngine = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const engineInstance = await CreateMLCEngine(model, {
                    initProgressCallback: (report: InitProgressReport) => {
                        setProgress(report.progress);
                    }
                });

                setEngine(engineInstance);
            } catch (err: any) {
                console.error('Ошибка инициализации модели:', err);
                setError(err.message || 'Не удалось загрузить модель. Пожалуйста, попробуйте позже.');
            } finally {
                setIsLoading(false);
            }
        };

        initEngine();

        // Очистка при размонтировании
        return () => {
            if (engine) {
                // WebLLM не имеет явного метода dispose, но можно обнулить ссылку
                setEngine(null);
            }
        };
    }, [model]);

    return { engine, progress, error, isLoading };
};

export default useWebLLM;