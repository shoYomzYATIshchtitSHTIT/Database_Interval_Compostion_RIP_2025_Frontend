import { useState } from 'react';
import type { FC } from 'react';
import { Container, Alert } from 'react-bootstrap';
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';

import useWebLLM from '../hooks/useWebLLM';
import ChatWindow from '../components/llm/ChatWindow';
import ModelLoader from '../components/llm/ModelLoader';
import InputArea from '../components/llm/InputArea';
import type { ChatMessage } from '../types/llmTypes';

const LlmTestPage: FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const { engine, progress, error, isLoading: modelLoading } = useWebLLM();

    const handleSend = async () => {
        if (!input.trim() || !engine || loading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Получаем контекст интервалов (в реальном приложении будет из пропсов)
            const intervalsContext = {
                count: 8, // Пример: 8 интервалов на странице
                titles: ["Прима", "Секунда", "Терция", "Кварта", "Квинта", "Секста", "Септима", "Октава"],
                tones: [0, 1, 2, 2.5, 3.5, 4.5, 5.5, 6]
            };

            // Улучшенный системный промпт
            const systemMessage: ChatMessage = {
                role: "system",
                content: `Ты - эксперт-музыковед, ассистент по музыкальным интервалам.
      
КОНТЕКСТ: На странице отображается ${intervalsContext.count} музыкальных интервалов:
${intervalsContext.titles.map((title, i) => `${i+1}. ${title} (тон: ${intervalsContext.tones[i]})`).join('\n')}

ТВОЯ РОЛЬ:
1. Консультант по музыкальным интервалам
2. Помощник в выборе интервалов для обучения
3. Эксперт по музыкальной теории

ПРАВИЛА:
1. Отвечай ТОЛЬКО на русском языке
2. Будь краток, но информативен (200-300 слов максимум)
3. Используй данные из контекста, когда уместно
4. Если вопрос не про музыку - вежливо откажись отвечать
5. Для сложных терминов давай простые объяснения

ТЕМЫ, В КОТОРЫХ ТЫ ЭКСПЕРТ:
- Определение и виды музыкальных интервалов
- Практическое применение интервалов
- Советы по обучению и практике
- Связь интервалов с аккордами и мелодиями
- Рекомендации для начинающих

ОТВЕЧАЙ В ДРУЖЕЛЮБНОМ И ПОДДЕРЖИВАЮЩЕМ ТОНЕ.`
            };

            // Берем последние 6 сообщений для контекста + системный промпт
            const recentMessages = messages.slice(-6);
            const chatRequest: ChatCompletionMessageParam[] = [
                systemMessage,
                ...recentMessages.map(msg => ({ role: msg.role, content: msg.content })),
                userMessage
            ];

            // Остальной код обработки потока...
            const stream = await engine.chat.completions.create({
                messages: chatRequest,
                temperature: 0.4, // Немного выше для более творческих ответов
                top_p: 0.9,
                max_tokens: 600,
                frequency_penalty: 0.2,
                presence_penalty: 0.1,
                stream: true
            });

            // Потоковая обработка ответа...
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
                    content: 'Произошла ошибка. Пожалуйста, переформулируйте вопрос или попробуйте позже.'
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <h1 className="mb-4">Тест музыкального ассистента</h1>
            <Alert variant="info" className="mb-4">
                <p className="mb-1">
                    <strong>WebLLM работает локально в браузере</strong>
                </p>
                <small>
                    Модель загружается с Hugging Face. При первом запуске это может занять несколько минут.
                    Требуется браузер с поддержкой WebGPU (Chrome 113+, Edge 113+).
                </small>
            </Alert>

            {modelLoading ? (
                <ModelLoader progress={progress} />
            ) : error ? (
                <Alert variant="danger">
                    <h5>Ошибка загрузки модели</h5>
                    <p>{error}</p>
                    <p className="mb-0">
                        <small>
                            Проверьте: 1) Поддержку WebGPU в браузере 2) Интернет-соединение
                        </small>
                    </p>
                </Alert>
            ) : (
                <>
                    <Alert variant="success" className="mb-3">
                        <strong>✓ Модель загружена!</strong> Задавайте вопросы о музыкальных интервалах.
                    </Alert>

                    <ChatWindow messages={messages} />
                    <InputArea
                        input={input}
                        loading={loading}
                        onInputChange={setInput}
                        onSend={handleSend}
                    />

                    <div className="mt-3">
                        <small className="text-muted">
                            Примеры вопросов: "Что такое музыкальный интервал?",
                            "Какие бывают интервалы?", "Какой интервал самый простой?"
                        </small>
                    </div>
                </>
            )}
        </Container>
    );
};

export default LlmTestPage;