import type { FC } from 'react';
import { Spinner, ProgressBar } from 'react-bootstrap';

interface ModelLoaderProps {
    progress: number;
}

const ModelLoader: FC<ModelLoaderProps> = ({ progress }) => (
    <div className="text-center p-4">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h5>Загрузка музыкального ассистента...</h5>
        <p className="text-muted mb-2">
            Модель загружается локально в ваш браузер ({Math.round(progress * 100)}%)
        </p>
        <ProgressBar
            now={progress * 100}
            label={`${Math.round(progress * 100)}%`}
            className="mb-3"
        />
        <small className="text-muted">
            Это займет некоторое время при первом использовании
        </small>
    </div>
);

export default ModelLoader;