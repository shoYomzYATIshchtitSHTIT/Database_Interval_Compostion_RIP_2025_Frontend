import { Card, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import type { Interval } from '../../types/interval'
import { DEFAULT_INTERVAL_IMAGE } from '../../services/apiWithMock'
import './IntervalCard.css'

interface IntervalCardProps {
    interval: Interval
    onAddToCart?: () => void
}

const IntervalCard = ({ interval, onAddToCart }: IntervalCardProps) => {
    return (
        <Card className="interval-card h-100">
            <div className="interval-image-container">
                <Card.Img
                    variant="top"
                    src={interval.photo || DEFAULT_INTERVAL_IMAGE}
                    alt={interval.title}
                    className="interval-image"
                />
            </div>

            <Card.Body className="d-flex flex-column">
                <div className="flex-grow-1">
                    <Card.Title className="interval-title">
                        {interval.title}
                    </Card.Title>

                    <Card.Text className="interval-description">
                        {interval.description}
                    </Card.Text>

                    <div className="interval-metadata">
                        <Badge bg="primary" className="interval-tone">
                            Тон: {interval.tone}
                        </Badge>
                    </div>
                </div>

                <div className="interval-actions mt-3">
                    <div className="d-grid gap-2">
                        <Link to={`/intervals/${interval.id}`}>
                            <Button variant="outline-primary" size="sm" className="w-100">
                                Подробнее
                            </Button>
                        </Link>

                        {onAddToCart && (
                            <Button
                                variant="success"
                                size="sm"
                                className="w-100"
                                onClick={onAddToCart}
                            >
                                Добавить в заявку
                            </Button>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}

export default IntervalCard