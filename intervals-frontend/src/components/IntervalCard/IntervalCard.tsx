import { Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import type { Interval } from '../../types/interval'
import { DEFAULT_INTERVAL_IMAGE } from '../../services/mockData'
import './IntervalCard.css'

interface IntervalCardProps {
    interval: Interval
}

const IntervalCard = ({ interval }: IntervalCardProps) => {
    const imageUrl = interval.photo || DEFAULT_INTERVAL_IMAGE

    return (
        <Card className="interval-card h-100">
            <div className="card-image-container">
                <Card.Img
                    variant="top"
                    src={imageUrl}
                    alt={interval.title}
                    className="interval-image"
                />
            </div>

            <Card.Body className="d-flex flex-column">
                <Card.Title className="interval-title">{interval.title}</Card.Title>
                <Card.Text className="interval-description flex-grow-1">
                    {interval.description}
                </Card.Text>

                <div className="interval-tone">
                    <strong>Тон: {interval.tone}</strong>
                </div>

                <div className="interval-actions mt-auto">
                    <Link to={`/intervals/${interval.id}`}>
                        <Button variant="primary" className="w-100">
                            Подробнее
                        </Button>
                    </Link>
                </div>
            </Card.Body>
        </Card>
    )
}

export default IntervalCard