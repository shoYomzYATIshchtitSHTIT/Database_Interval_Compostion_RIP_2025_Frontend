import type { FC } from 'react';
import type { ChatMessage, IntervalsContext } from '../../types/llmTypes';
import Message from './Message';
import { Alert } from 'react-bootstrap';

interface ChatWindowProps {
    messages: ChatMessage[];
    intervals?: IntervalsContext;
}

const ChatWindow: FC<ChatWindowProps> = ({ messages, intervals }) => {
    // Фильтруем системные сообщения (не показываем пользователю)
    const visibleMessages = messages.filter(msg => msg.role !== 'system');

    return (
        <div className="chat-window" style={{
            height: '300px',
            overflowY: 'auto',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
        }}>
            {intervals && intervals.count > 0 && (
                <Alert variant="info" className="py-1 px-2 mb-2" style={{ fontSize: '0.85rem' }}>
                    <small>
                        Ассистент видит {intervals.count} интервалов на странице
                    </small>
                </Alert>
            )}

            {visibleMessages.length === 0 ? (
                <div className="text-center text-muted p-4">
                    <p>Задайте вопрос о музыкальных интервалах</p>
                    <small>Например: "Что такое интервал?" или "Какой интервал самый простой?"</small>
                </div>
            ) : (
                visibleMessages.map((msg, idx) => (
                    <Message key={idx} msg={msg} />
                ))
            )}
        </div>
    );
};

export default ChatWindow;