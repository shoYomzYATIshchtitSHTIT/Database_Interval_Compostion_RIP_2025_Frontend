import type { FC } from 'react';
import type { ChatMessage } from '../../types/llmTypes';
import { Card } from 'react-bootstrap';

interface MessageProps {
    msg: ChatMessage;
}

const Message: FC<MessageProps> = ({ msg }) => {
    const isUser = msg.role === 'user';

    return (
        <Card
            className={`mb-3 ${isUser ? 'ms-auto' : ''}`}
            style={{
                maxWidth: '85%',
                backgroundColor: isUser ? '#e3f2fd' : '#f8f9fa',
                borderColor: isUser ? '#bbdefb' : '#e9ecef'
            }}
        >
            <Card.Body className="p-2">
                <Card.Subtitle
                    className={`mb-1 ${isUser ? 'text-primary' : 'text-secondary'}`}
                    style={{ fontSize: '0.8rem' }}
                >
                    {isUser ? 'Вы' : 'Музыкальный ассистент'}
                </Card.Subtitle>
                <Card.Text className="mb-0" style={{ fontSize: '0.95rem' }}>
                    {msg.content}
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default Message;