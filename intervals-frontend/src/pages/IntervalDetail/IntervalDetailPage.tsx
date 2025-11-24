import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import type { Interval } from '../../types/interval'
import { intervalsApiWithMock, DEFAULT_INTERVAL_IMAGE } from '../../services/apiWithMock'
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs'
import './IntervalDetailPage.css'

const IntervalDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const [interval, setInterval] = useState<Interval | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadInterval = async () => {
            if (!id || isNaN(parseInt(id))) {
                setError('Неверный ID интервала')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                const intervalId = parseInt(id)
                console.log('Загрузка интервала с ID:', intervalId)

                const intervalData = await intervalsApiWithMock.getInterval(intervalId)
                setInterval(intervalData)
            } catch (err) {
                setError('Не удалось загрузить информацию об интервале')
                console.error('Error loading interval:', err)
            } finally {
                setLoading(false)
            }
        }

        loadInterval()
    }, [id])

    if (loading) {
        return (
            <Container>
                <Breadcrumbs interval={interval} />
                <div className="loading-container">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Загрузка...</span>
                    </Spinner>
                    <p className="loading-text">Загрузка интервала...</p>
                </div>
            </Container>
        )
    }

    if (error || !interval) {
        return (
            <Container>
                <Breadcrumbs interval={interval} />
                <Alert variant="danger">
                    <Alert.Heading>Ошибка</Alert.Heading>
                    <p>{error || 'Интервал не найден'}</p>
                </Alert>
            </Container>
        )
    }

    return (
        <Container>
            <Breadcrumbs interval={interval} />

            <div className="interval-detail-header">
                <h1>{interval.title}</h1>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="interval-detail-card">
                        <Row className="g-0">
                            <Col md={6}>
                                <div className="image-container">
                                    <img
                                        src={interval.photo || DEFAULT_INTERVAL_IMAGE}
                                        alt={interval.title}
                                        className="detail-image"
                                    />
                                </div>
                            </Col>
                            <Col md={6}>
                                <Card.Body className="interval-detail-body">
                                    <div className="interval-info">
                                        <h3 className="interval-title">{interval.title}</h3>
                                        <p className="interval-description">{interval.description}</p>

                                        <div className="interval-properties">
                                            <div className="property">
                                                <span className="property-label">Тон:</span>
                                                <span className="property-value">{interval.tone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default IntervalDetailPage