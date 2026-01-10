import type { FC } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

interface InputAreaProps {
    input: string;
    loading: boolean;
    onInputChange: (value: string) => void;
    onSend: () => void;
}

const InputArea: FC<InputAreaProps> = ({
                                           input,
                                           loading,
                                           onInputChange,
                                           onSend
                                       }) => {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="mt-3">
            <InputGroup>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Спросите о музыкальных интервалах..."
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    style={{ resize: 'none' }}
                />
                <Button
                    variant="primary"
                    onClick={onSend}
                    disabled={loading || !input.trim()}
                    style={{ minWidth: '100px' }}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Отправка...
                        </>
                    ) : 'Отправить'}
                </Button>
            </InputGroup>

            <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">
                    Нажмите Enter для отправки, Shift+Enter для новой строки
                </small>
                <small className="text-muted">
                    {input.length}/500
                </small>
            </div>
        </div>
    );
};

export default InputArea;