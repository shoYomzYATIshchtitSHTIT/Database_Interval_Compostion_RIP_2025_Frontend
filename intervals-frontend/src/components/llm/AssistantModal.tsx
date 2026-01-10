import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';

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
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    // Сброс при закрытии
    useEffect(() => {
        if (!show) {
            setInput('');
            setLoading(false);
        } else {
            setHasOpened(true);
        }
    }, [show]);

    const handleSend = async () => {
        if (!input.trim() || !engine || loading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Динамический системный промпт на основе контекста
            let systemPrompt = `Ты - музыкальный ассистент, помогающий пользователям с интервалами.

КОНТЕКСТ СТРАНИЦЫ:
- Всего интервалов: ${intervalsContext.count}
- Текущие интервалы: ${intervalsContext.titles.slice(0, 5).join(', ')}${intervalsContext.titles.length > 5 ? '...' : ''}
- Диапазон тонов: ${Math.min(...intervalsContext.tones)} - ${Math.max(...intervalsContext.tones)}`;

            if (intervalsContext.filters?.title) {
                systemPrompt += `\n- Активный фильтр по названию: "${intervalsContext.filters.title}"`;
            }
            if (intervalsContext.filters?.toneMin || intervalsContext.filters?.toneMax) {
                systemPrompt += `\n- Фильтр по тону: ${intervalsContext.filters.toneMin || 0} - ${intervalsContext.filters.toneMax || 'макс'}`;
            }

            if (userInfo?.isAuthenticated && userInfo.name) {
                systemPrompt += `\n\nПОЛЬЗОВАТЕЛЬ: ${userInfo.name} (авторизован)`;
            }

            systemPrompt += `\n\nОТВЕЧАЙ ТОЛЬКО НА РУССКОМ. Будь полезным, кратким и дружелюбным.`;

            const systemMessage: ChatMessage = {
                role: "system",
                content: systemPrompt
            };

            // Ограничиваем историю 5 последними сообщениями
            const recentMessages = messages.slice(-5);
            const chatRequest: ChatCompletionMessageParam[] = [
                systemMessage,
                ...recentMessages.map(msg => ({ role: msg.role, content: msg.content })),
                userMessage
            ];

            const stream = await engine.chat.completions.create({
                messages: chatRequest,
                temperature: 0.35,
                top_p: 0.9,
                max_tokens: 500,
                frequency_penalty: 0.2,
                presence_penalty: 0.1,
                stream: true
            });

            let reply = '';
            const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
            const newMessages = [...messages, assistantMessage];
            setMessages(newMessages);

            for await (const chunk of stream) {
                const chunkContent = chunk.choices?.[0]?.delta?.content || '';
                reply += chunkContent;

                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: reply };
                    return updated;
                });
            }
        } catch (error: any) {
            console.error('Ошибка генерации:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Произошла техническая ошибка. Попробуйте переформулировать вопрос или обратитесь позже.'
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuestion = (question: string) => {
        setInput(question);
    };

    const resetChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: 'Здравствуйте! Чем могу помочь с интервалами?'
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
        >
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    🎵 Музыкальный ассистент
                    <small className="ms-2" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {intervalsContext.count > 0
                            ? `видит ${intervalsContext.count} интервалов`
                            : 'загружается...'}
                    </small>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ minHeight: '400px' }}>
                {!hasOpened ? (
                    <div className="text-center p-4">
                        <p>Открытие ассистента...</p>
                    </div>
                ) : modelLoading ? (
                    <ModelLoader progress={progress} />
                ) : error ? (
                    <Alert variant="danger">
                        <h6>Не удалось загрузить ассистента</h6>
                        <p className="mb-2">{error}</p>
                        <small>
                            Попробуйте обновить страницу или используйте браузер Chrome/Edge.
                        </small>
                    </Alert>
                ) : (
                    <>
                        <div className="mb-3">
                            <small className="text-muted d-block mb-2">Быстрые вопросы:</small>
                            <div className="d-flex flex-wrap gap-2">
                                {[
                                    "Что такое интервал?",
                                    "Какой интервал самый простой?",
                                    "Что означают тона?",
                                    "Как выбрать интервал для начала?"
                                ].map((question, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleQuickQuestion(question)}
                                        disabled={loading}
                                        className="flex-grow-0"
                                    >
                                        {question}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={resetChat}
                                    className="flex-grow-0"
                                >
                                    ↻ Сбросить
                                </Button>
                            </div>
                        </div>

                        <div
                            ref={chatWindowRef}
                            style={{
                                height: '280px',
                                overflowY: 'auto',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6'
                            }}
                        >
                            <ChatWindow messages={messages} intervals={intervalsContext} />
                        </div>

                        <InputArea
                            input={input}
                            loading={loading}
                            onInputChange={setInput}
                            onSend={handleSend}
                        />

                        <div className="mt-2">
                            <small className="text-muted">
                                💡 Работает локально в браузере • Модель: Llama-3.2-1B
                            </small>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AssistantModal;