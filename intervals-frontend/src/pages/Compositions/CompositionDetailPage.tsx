import { useEffect, useState } from 'react'
import { Container, Card, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import {
    getCompositionDetail,
    updateCompositionFields,
    updateIntervalAmount,
    deleteComposition,
    formComposition
} from '../../store/slices/compositionsSlice'
import { useParams, useNavigate } from 'react-router-dom'

const CompositionDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const { currentComposition, loading, error } = useSelector((state: RootState) => state.compositions)
    const [compositionName, setCompositionName] = useState('')
    const [intervalAmounts, setIntervalAmounts] = useState<Record<number, number>>({})

    // ---------- Load composition ----------
    useEffect(() => {
        if (id) {
            console.log(`[USEEFFECT] Loading composition with ID: ${id}`)
            dispatch(getCompositionDetail(Number(id)))
        }
    }, [dispatch, id])

    // ---------- Update local state when composition changes ----------
    useEffect(() => {
        console.log('[USEEFFECT] currentComposition changed:', currentComposition)
        if (currentComposition) {
            setCompositionName(currentComposition.title || '')
            const amounts: Record<number, number> = {}
            currentComposition.intervals?.forEach((interval) => {
                amounts[interval.interval_id] = interval.amount || 1
                console.log(`[INTERVAL] ID: ${interval.interval_id}, Title: ${interval.title}, Description: ${interval.description}, Tone: ${interval.tone}, Amount: ${interval.amount}`)
            })
            setIntervalAmounts(amounts)
        }
    }, [currentComposition])

    // ---------- Handlers ----------
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('[HANDLE_NAME_CHANGE] New title:', e.target.value)
        setCompositionName(e.target.value)
    }

    const handleSaveName = () => {
        if (currentComposition) {
            console.log('[HANDLE_SAVE_NAME] Saving title:', compositionName)
            dispatch(updateCompositionFields({ id: currentComposition.id, updates: { title: compositionName } }))
        }
    }

    const handleAmountChange = (intervalId: number, value: number) => {
        setIntervalAmounts((prev) => ({ ...prev, [intervalId]: value }))
    }

    const handleSaveAmount = (intervalId: number) => {
        if (currentComposition) {
            const amount = intervalAmounts[intervalId]
            console.log(`[HANDLE_SAVE_AMOUNT] Saving amount: IntervalID=${intervalId}, Amount=${amount}`)
            dispatch(updateIntervalAmount({ composition_id: currentComposition.id, interval_id: intervalId, amount }))
        }
    }

    const handleFormComposition = () => {
        if (currentComposition) {
            console.log('[HANDLE_FORM_COMPOSITION] Forming composition ID:', currentComposition.id)
            dispatch(formComposition(currentComposition.id))
        }
    }

    const handleDeleteComposition = () => {
        if (currentComposition) {
            console.log('[HANDLE_DELETE_COMPOSITION] Deleting composition ID:', currentComposition.id)
            dispatch(deleteComposition(currentComposition.id))
            navigate('/compositions')
        }
    }

    // ---------- Loading / Error states ----------
    if (loading || !currentComposition) {
        console.log('[RENDER] Loading or composition not loaded yet')
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" variant="primary" />
            </Container>
        )
    }

    if (error) {
        console.error('[RENDER] Error:', error)
        return (
            <Container className="mt-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        )
    }

    // ---------- Main render ----------
    console.log('[RENDER] Rendering composition page with title:', compositionName)

    return (
        <Container className="mt-4 composition-page">
            <h2>Составление заявки</h2>
            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Введите название произведения"
                    value={compositionName}
                    onChange={handleNameChange}
                />
                <Button className="mt-2" variant="primary" onClick={handleSaveName}>
                    Сохранить название
                </Button>
            </Form.Group>

            {currentComposition.intervals && currentComposition.intervals.length > 0 ? (
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
                                <Row className="g-2">
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            value={intervalAmounts[interval.interval_id] || 1}
                                            onChange={(e) => handleAmountChange(interval.interval_id, Number(e.target.value))}
                                        />
                                    </Col>
                                    <Col>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleSaveAmount(interval.interval_id)}
                                        >
                                            Сохранить
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                ))
            ) : (
                <p>Интервалы не добавлены</p>
            )}

            <div className="d-flex justify-content-between mt-4">
                <Button variant="success" onClick={handleFormComposition}>
                    Сформировать заявку
                </Button>
                <Button variant="danger" onClick={handleDeleteComposition}>
                    Удалить заявку
                </Button>
            </div>
        </Container>
    )
}

export default CompositionDetailPage
