import { useEffect, useState } from 'react'
import { Container, Card, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import {
    getCompositionDetail,
    updateCompositionFields,
    updateIntervalAmount,
    deleteComposition,
    formComposition,
    removeIntervalFromComposition
} from '../../store/slices/compositionsSlice'
import { useParams, useNavigate } from 'react-router-dom'
import './CompositionDetailPage.css'

const CompositionDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const { currentComposition, loading, error } = useSelector((state: RootState) => state.compositions)
    const [compositionName, setCompositionName] = useState('')
    const [intervalAmounts, setIntervalAmounts] = useState<Record<number, number>>({})

    useEffect(() => {
        if (id) dispatch(getCompositionDetail(Number(id)))
    }, [dispatch, id])

    useEffect(() => {
        if (currentComposition) {
            setCompositionName(currentComposition.title || '')
            const amounts: Record<number, number> = {}
            currentComposition.intervals?.forEach((interval) => {
                amounts[interval.interval_id] = interval.amount || 1
            })
            setIntervalAmounts(amounts)
        }
    }, [currentComposition])

    const handleSaveName = () => {
        if (currentComposition)
            dispatch(updateCompositionFields({ id: currentComposition.id, updates: { title: compositionName } }))
    }

    const handleAmountChange = (intervalId: number, value: number) => {
        setIntervalAmounts(prev => ({ ...prev, [intervalId]: value }))
    }

    const handleSaveAmount = (intervalId: number) => {
        if (currentComposition)
            dispatch(updateIntervalAmount({
                composition_id: currentComposition.id,
                interval_id: intervalId,
                amount: intervalAmounts[intervalId]
            }))
    }

    const handleDeleteInterval = (intervalId: number) => {
        if (currentComposition)
            dispatch(removeIntervalFromComposition({
                composition_id: currentComposition.id,
                interval_id: intervalId
            }))
    }

    const handleFormComposition = () => {
        if (currentComposition) dispatch(formComposition(currentComposition.id))
    }

    const handleDeleteComposition = () => {
        if (currentComposition) {
            dispatch(deleteComposition(currentComposition.id))
            navigate('/compositions')
        }
    }

    if (loading || !currentComposition)
        return <Container className="mt-4 text-center"><Spinner animation="border" /></Container>

    if (error)
        return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>

    return (
        <>
            {/* ОСНОВНОЕ СОДЕРЖАНИЕ */}
            <Container className="mt-4 composition-page">
                <h2>Составление композиции</h2>

                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Введите название произведения"
                        value={compositionName}
                        onChange={(e) => setCompositionName(e.target.value)}
                    />
                    <Button className="mt-2" variant="primary" onClick={handleSaveName}>
                        Сохранить название
                    </Button>
                </Form.Group>

                {currentComposition.intervals?.length ? (
                    currentComposition.intervals.map((interval) => (
                        <Card key={interval.interval_id} className="mb-3">
                            <Row className="g-0 align-items-center">
                                <Col md={3}>
                                    <Card.Img
                                        src={interval.photo || '/img/default_interval.png'}
                                        alt={interval.title}
                                        className="p-2"
                                    />
                                </Col>
                                <Col md={6}>
                                    <Card.Body>
                                        <Card.Title>{interval.title}</Card.Title>
                                        {interval.description && <Card.Text>{interval.description}</Card.Text>}
                                        {interval.tone !== undefined && <Card.Text>Тон: {interval.tone}</Card.Text>}
                                    </Card.Body>
                                </Col>
                                <Col md={3} className="text-center">
                                    <Form.Label>Количество</Form.Label>
                                    <Row className="g-2 mb-2">
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                min={1}
                                                value={intervalAmounts[interval.interval_id] || 1}
                                                onChange={(e) => handleAmountChange(interval.interval_id, Number(e.target.value))}
                                            />
                                        </Col>
                                        <Col>
                                            <Button variant="primary" onClick={() => handleSaveAmount(interval.interval_id)}>
                                                Сохранить
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteInterval(interval.interval_id)}
                                    >
                                        Удалить
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    ))
                ) : (
                    <p>Интервалы не добавлены</p>
                )}

                <div className="d-flex justify-content-between mt-4">
                    <Button variant="success" onClick={handleFormComposition}>
                        Сформировать композицию
                    </Button>
                    <Button variant="danger" onClick={handleDeleteComposition}>
                        Удалить композицию
                    </Button>
                </div>
            </Container>

            {currentComposition.status === "Завершена" && (
                <div className="composition-result-wrapper">
                    <div className="composition-result">
                        Композиция {currentComposition.belonging} к классицизму
                    </div>
                </div>
            )}
        </>
    )
}

export default CompositionDetailPage
