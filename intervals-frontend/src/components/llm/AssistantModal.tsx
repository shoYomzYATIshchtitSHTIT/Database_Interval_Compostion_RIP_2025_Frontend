import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import type { ChatCompletionMessageParam, ChatCompletionRole } from '@mlc-ai/web-llm'; // Импортируем правильный тип

import useWebLLM from '../../hooks/useWebLLM';
import ChatWindow from './ChatWindow';
import ModelLoader from './ModelLoader';
import InputArea from './InputArea';
import type { ChatMessage, IntervalsContext } from '../../types/llmTypes';

interface AssistantModalProps {
    show: boolean;
    onHide: () => void;
    intervalsContext: IntervalsContext;
    userInfo?: {
        isAuthenticated: boolean;
        name?: string;
    };
}

const AssistantModal: FC<AssistantModalProps> = ({
                                                     show,
                                                     onHide,
                                                     intervalsContext,
                                                     userInfo
                                                 }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Здравствуйте! Я ваш музыкальный ассистент. Помогу разобраться с интервалами на этой странице. Чем могу помочь?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const [hasOpened, setHasOpened] = useState(false);

    // Ленивая загрузка модели только при открытии модалки
    const { engine, progress, error, isLoading: modelLoading } = useWebLLM();

    // Скролл к последнему сообщению
    useEffect(() => {
        if (chatWindowRef.current && messages.length > 0) {
            setTimeout(() => {
                if (chatWindowRef.current) {
                    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [messages]);

    // Сброс при закрытии
    useEffect(() => {
        if (!show) {
            setLoading(false);
        } else {
            setHasOpened(true);
            console.log('[AssistantModal] Opened with context:', {
                intervalsCount: intervalsContext.count,
                hasFilters: intervalsContext.filters
            });
        }
    }, [show, intervalsContext]);

    // Функция для преобразования наших сообщений в формат WebLLM
    const convertToWebLLMMessage = (msg: ChatMessage): ChatCompletionMessageParam => {
        // Преобразуем роль в допустимый тип для WebLLM
        const role: ChatCompletionRole = msg.role === 'system' ? 'system'
            : msg.role === 'assistant' ? 'assistant'
                : 'user';

        return {
            role: role,
            content: msg.content
        };
    };

    const getSystemPrompt = (): string => {
        let prompt = `Ты - музыкальный ассистент, помогающий пользователям разобраться в музыкальных интервалах.

КОНТЕКСТ СТРАНИЦЫ:
- Пользователь видит ${intervalsContext.count} интервалов
- Общее количество интервалов в базе: ${intervalsContext.metadata?.totalItems || intervalsContext.count}
- Страница ${intervalsContext.metadata?.currentPage || 1} из ${intervalsContext.metadata?.totalPages || 1}`;

        if (intervalsContext.filters?.title) {
            prompt += `\n- Активный поиск: "${intervalsContext.filters.title}"`;
        }
        if (intervalsContext.filters?.toneMin || intervalsContext.filters?.toneMax) {
            const min = intervalsContext.filters.toneMin || 0;
            const max = intervalsContext.filters.toneMax || '∞';
            prompt += `\n- Фильтр по тону: ${min} - ${max}`;
        }

        // Добавляем список интервалов с тонами и описаниями
        if (intervalsContext.intervals.length > 0) {
            prompt += `\n\nТЕКУЩИЕ ИНТЕРВАЛЫ НА СТРАНИЦЕ:`;

            // Берем только первые 5 интервалов, чтобы не перегружать промпт
            const displayIntervals = intervalsContext.intervals.slice(0, 5);
            displayIntervals.forEach((interval, index) => {
                prompt += `\n${index + 1}. "${interval.title}"`;
                prompt += ` - Тон: ${interval.tone}`;
                if (interval.description && interval.description.length < 100) {
                    prompt += ` (${interval.description})`;
                }
            });

            if (intervalsContext.intervals.length > 5) {
                prompt += `\n... и еще ${intervalsContext.intervals.length - 5} интервалов`;
            }
        }

        prompt += `\n\nТВОЯ ЗАДАЧА:
1. Отвечать на вопросы о КОНКРЕТНЫХ интервалах выше
2. Объяснять значение тонов (${intervalsContext.intervals.map(i => i.tone).join(', ')})
3. Сравнивать интервалы по тонам
4. Объяснять описания интервалов простыми словами
5. Рекомендовать интервалы на основе их характеристик

ПРАВИЛА ОТВЕТОВ:
- Используй конкретные числа тонов из данных выше
- Цитируй описания интервалов при ответе
- Сравнивай интервалы по тонам: выше/ниже, проще/сложнее
- Отвечай кратко, но информативно
- Если просят сравнить - используй числовые значения тонов`;

        if (userInfo?.isAuthenticated) {
            prompt += '\n\nПОЛЬЗОВАТЕЛЬ: музыкант (авторизован)';
        }

        return prompt;
    };

    const handleSend = async () => {
        if (!input.trim() || !engine || loading) return;

        console.log('[AssistantModal] Sending message:', input);

        // 1. Сразу добавляем сообщение пользователя
        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // 2. Подготавливаем системный промпт
            const systemMessage: ChatMessage = {
                role: "system",
                content: getSystemPrompt()
            };

            // 3. Берем только последние 4 сообщения для контекста
            const recentMessages = messages.slice(-4);

            // 4. Формируем запрос с правильной типизацией
            const chatRequest: ChatCompletionMessageParam[] = [
                convertToWebLLMMessage(systemMessage),
                ...recentMessages.map(msg => convertToWebLLMMessage(msg)),
                convertToWebLLMMessage({ role: 'user', content: input })
            ];

            console.log('[AssistantModal] Chat request prepared, messages:', chatRequest.length);

            // 5. Создаём место для ответа ассистента
            const assistantMessage: ChatMessage = { role: 'assistant', content: '...' };
            setMessages(prev => [...prev, assistantMessage]);

            // 6. Запрашиваем ответ БЕЗ потокового вывода для стабильности
            const response = await engine.chat.completions.create({
                messages: chatRequest,
                temperature: 0.4,
                top_p: 0.9,
                max_tokens: 400, // Оптимальное количество токенов
                frequency_penalty: 0.3,
                presence_penalty: 0.2,
                stream: false // Не потоковый для надежности
            });

            const reply = response.choices[0]?.message?.content || 'Извините, не могу сформулировать ответ.';

            console.log('[AssistantModal] Received reply:', reply.substring(0, 100) + '...');

            // 7. Обновляем последнее сообщение ассистента
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: reply
                };
                return updated;
            });

        } catch (error: any) {
            console.error('[AssistantModal] Generation error:', error);
            setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: 'Произошла ошибка генерации. Пожалуйста, переформулируйте вопрос или попробуйте позже.'
                    };
                }
                return updated;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuestion = (question: string) => {
        console.log('[AssistantModal] Quick question:', question);

        // Если есть конкретные интервалы, формируем умные вопросы
        if (intervalsContext.intervals.length > 0) {
            const firstInterval = intervalsContext.intervals[0];
            const highToneInterval = intervalsContext.intervals.reduce((prev, current) =>
                (prev.tone > current.tone) ? prev : current
            );

            const customQuestions: Record<string, string> = {
                "Какой интервал с самым высоким тоном?": `Какой интервал здесь с самым высоким тоном? Сейчас вижу интервал "${highToneInterval.title}" с тоном ${highToneInterval.tone}.`,
                "Объясни первый интервал": `Объясни интервал "${firstInterval.title}". Его тон: ${firstInterval.tone}, описание: ${firstInterval.description.substring(0, 100)}...`,
                "Сравни интервалы по тонам": `Сравни интервалы на странице по их тонам. Тоны: ${intervalsContext.intervals.map(i => `${i.title}: ${i.tone}`).join(', ')}`
            };

            if (customQuestions[question]) {
                setInput(customQuestions[question]);
                return;
            }
        }

        setInput(question);
    };

    const resetChat = () => {
        console.log('[AssistantModal] Resetting chat');
        setMessages([
            {
                role: 'assistant',
                content: 'Чат сброшен. Чем могу помочь с интервалами?'
            }
        ]);
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            backdrop="static"
            className="modal-assistant"
        >
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <span style={{ marginRight: '10px' }}>🎵</span>
                    Музыкальный ассистент
                    <small className="ms-2" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {intervalsContext.count > 0
                            ? `${intervalsContext.count} интервалов`
                            : 'загрузка...'}
                    </small>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{
                minHeight: '450px',
                padding: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {!hasOpened ? (
                    <div className="text-center p-4">
                        <p>Загрузка ассистента...</p>
                    </div>
                ) : modelLoading ? (
                    <ModelLoader progress={progress} />
                ) : error ? (
                    <Alert variant="danger">
                        <h6>⚠️ Не удалось загрузить ассистента</h6>
                        <p className="mb-2">{error}</p>
                        <small>
                            Для работы ассистента требуется браузер с поддержкой WebGPU (Chrome 113+, Edge 113+).
                        </small>
                    </Alert>
                ) : (
                    <>
                        <div className="mb-3">
                            <small className="text-muted d-block mb-2">Быстрые вопросы:</small>
                            <div className="d-flex flex-wrap gap-2">
                                {/* Стандартные вопросы */}
                                {[
                                    "Что такое музыкальный интервал?",
                                    "Какой интервал здесь с самым высоким тоном?",
                                    "Объясни первый интервал на странице",
                                    "Сравни интервалы по тонам"
                                ].map((question, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleQuickQuestion(question)}
                                        disabled={loading}
                                        className="flex-grow-0"
                                        style={{fontSize: '0.85rem', padding: '4px 8px'}}
                                    >
                                        {question.length > 30 ? question.substring(0, 30) + '...' : question}
                                    </Button>
                                ))}

                                {/* Контекстные вопросы, если есть интервалы */}
                                {intervalsContext.intervals.length > 0 && intervalsContext.intervals[0] && (
                                    <Button
                                        variant="outline-info"
                                        size="sm"
                                        onClick={() => handleQuickQuestion(`Расскажи про интервал "${intervalsContext.intervals[0].title}"`)}
                                        disabled={loading}
                                        className="flex-grow-0"
                                        style={{fontSize: '0.85rem', padding: '4px 8px'}}
                                    >
                                        Про {intervalsContext.intervals[0].title.substring(0, 15)}...
                                    </Button>
                                )}

                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={resetChat}
                                    className="flex-grow-0"
                                    style={{fontSize: '0.85rem', padding: '4px 8px'}}
                                >
                                    ↻ Сброс
                                </Button>
                            </div>
                        </div>

                        {/* Контейнер чата с ЕДИНСТВЕННЫМ скроллом */}
                        <div
                            ref={chatWindowRef}
                            style={{
                                flex: '1',
                                overflowY: 'auto',
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6',
                                marginBottom: '15px',
                                minHeight: '250px'
                            }}
                        >
                            <ChatWindow messages={messages} intervals={intervalsContext}/>
                        </div>

                        {/* Поле ввода */}
                        <div style={{marginTop: 'auto'}}>
                            <InputArea
                                input={input}
                                loading={loading}
                                onInputChange={setInput}
                                onSend={handleSend}
                            />

                            <div className="mt-2 text-center">
                                <small className="text-muted">
                                    💡 Работает локально • Модель: Llama-3.2-1B • Ответы: 2-4 предложения
                                </small>
                            </div>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AssistantModal;