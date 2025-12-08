import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Container, Row, Col, Card, Button, Table, Badge,
    Spinner, Alert, Form, Modal
} from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import {
    getCompositions,
    completeComposition,
    rejectComposition
} from '../../store/slices/compositionsSlice';


const ModeratorCompositionsPage: React.FC = () => {
    const { compositions, loading, error } = useSelector((state: RootState) => state.compositions);
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Состояния фильтров
    const [filters, setFilters] = useState({
        status: '',
        date_from: '',
        date_to: '',
        creator_filter: '', // Фильтр по создателю на фронтенде
    });

    // Состояния для Short Polling
    const [pollingActive, setPollingActive] = useState<boolean>(true);
    const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
    const [autoRefreshCount, setAutoRefreshCount] = useState<number>(0);

    // Состояния для модального окна
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedCompositionId, setSelectedCompositionId] = useState<number | null>(null);
    const [selectedCompositionTitle, setSelectedCompositionTitle] = useState<string>('');

    // Функция загрузки композиций
    const loadCompositions = useCallback(() => {
        // Бэкенд фильтры (только даты и статус)
        const backendFilters = {
            status: filters.status,
            date_from: filters.date_from,
            date_to: filters.date_to,
        };

        dispatch(getCompositions(backendFilters));
        setLastUpdateTime(new Date().toLocaleTimeString('ru-RU'));
        setAutoRefreshCount(prev => prev + 1);
    }, [dispatch, filters.status, filters.date_from, filters.date_to]);

    // === SHORT POLLING ЛОГИКА ===
    useEffect(() => {
        if (!user?.is_moderator) return;

        // Первая загрузка
        loadCompositions();

        if (pollingActive) {
            // Запуск Short Polling каждые 5 секунд
            const intervalId = setInterval(() => {
                loadCompositions();
            }, 5000); // 5000 мс = 5 секунд

            // Очистка интервала при размонтировании или изменении pollingActive
            return () => {
                clearInterval(intervalId);
            };
        }
    }, [user, pollingActive, loadCompositions]);

    // Обработчики действий
    const handleCompleteClick = (compositionId: number, title?: string) => {
        setSelectedCompositionId(compositionId);
        setSelectedCompositionTitle(title || `#${compositionId}`);
        setShowCompleteModal(true);
    };

    const handleConfirmComplete = async () => {
        if (selectedCompositionId) {
            try {
                await dispatch(completeComposition(selectedCompositionId)).unwrap();
                alert(`Заявка "${selectedCompositionTitle}" завершена. Запущен асинхронный расчёт принадлежности (5-10 секунд).`);
            } catch (error) {
                alert('Ошибка при завершении заявки');
            }
            setShowCompleteModal(false);
        }
    };

    const handleReject = async (compositionId: number, title?: string) => {
        if (window.confirm(`Отклонить заявку "${title || '#' + compositionId}"?`)) {
            try {
                await dispatch(rejectComposition(compositionId)).unwrap();
                alert('Заявка отклонена');
            } catch (error) {
                alert('Ошибка при отклонении заявки');
            }
        }
    };

    const handleViewDetails = (compositionId: number) => {
        navigate(`/compositions/${compositionId}`);
    };

    // Фильтрация композиций на фронтенде
    const filteredCompositions = useMemo(() => {
        let filtered = [...compositions];

        // Фильтрация по создателю (логину) - на фронтенде
        if (filters.creator_filter) {
            filtered = filtered.filter(comp => {
                const creatorStr = `Пользователь ${comp.creator_id}`;
                return creatorStr.toLowerCase().includes(filters.creator_filter.toLowerCase());
            });
        }

        // Сортировка: сначала "Сформирована", потом "Завершена", потом остальные
        filtered.sort((a, b) => {
            const statusOrder = { 'Сформирована': 1, 'Завершена': 2, 'Отклонена': 3, 'Черновик': 4 };
            const orderA = statusOrder[a.status as keyof typeof statusOrder] || 5;
            const orderB = statusOrder[b.status as keyof typeof statusOrder] || 5;

            if (orderA !== orderB) return orderA - orderB;
            return new Date(b.date_create).getTime() - new Date(a.date_create).getTime();
        });

        return filtered;
    }, [compositions, filters.creator_filter]);

    // Вспомогательные функции
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Черновик': return 'secondary';
            case 'Сформирована': return 'primary';
            case 'Завершена': return 'success';
            case 'Отклонена': return 'danger';
            default: return 'secondary';
        }
    };

    const getBelongingVariant = (belonging?: string, status?: string) => {
        if (!belonging) {
            if (status === 'Завершена') return 'warning'; // Расчёт в процессе
            return 'light';
        }
        return belonging === 'принадлежит' ? 'success' : 'danger';
    };

    const getBelongingText = (belonging?: string, status?: string) => {
        if (!belonging) {
            if (status === 'Завершена') return 'Расчёт...';
            return '—';
        }
        return belonging;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };


    const togglePolling = () => {
        setPollingActive(!pollingActive);
    };

    if (loading && compositions.length === 0) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
                <p className="mt-3">Загрузка списка заявок...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Заголовок и управление */}
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1>Панель модератора</h1>
                    <p className="text-muted mb-0">Управление всеми заявками системы</p>
                </Col>
                <Col xs="auto">
                    <div className="d-flex gap-2 align-items-center">
                        {/* Индикатор Short Polling */}
                        <div className="me-3">
                            <Badge bg={pollingActive ? "success" : "secondary"}>
                                <i className={`bi bi-${pollingActive ? 'play' : 'pause'}-circle me-1`}></i>
                                Auto-refresh {pollingActive ? 'ON' : 'OFF'}
                            </Badge>
                            {lastUpdateTime && (
                                <small className="text-muted ms-2">
                                    Обновлено: {lastUpdateTime}
                                </small>
                            )}
                        </div>

                        <Button
                            variant={pollingActive ? "outline-warning" : "outline-success"}
                            size="sm"
                            onClick={togglePolling}
                            title={pollingActive ? "Остановить автообновление" : "Включить автообновление"}
                        >
                            <i className={`bi bi-${pollingActive ? 'pause' : 'play'}-fill`}></i>
                        </Button>

                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={loadCompositions}
                            title="Обновить сейчас"
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                        </Button>

                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setFilters({
                                status: '',
                                date_from: '',
                                date_to: '',
                                creator_filter: '',
                            })}
                            title="Сбросить фильтры"
                        >
                            <i className="bi bi-x-circle"></i>
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Сообщения об ошибках */}
            {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={() => {}}>
                    <Alert.Heading>Ошибка!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {/* Фильтры */}
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">
                        <i className="bi bi-funnel me-2"></i>
                        Фильтры
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Статус</Form.Label>
                                <Form.Select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        status: e.target.value
                                    }))}
                                >
                                    <option value="">Все статусы</option>
                                    <option value="Сформирована">Сформирована</option>
                                    <option value="Завершена">Завершена</option>
                                    <option value="Отклонена">Отклонена</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Создатель (ID или текст)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Например: 123 или 'Пользователь'"
                                    value={filters.creator_filter}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        creator_filter: e.target.value
                                    }))}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Дата от</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        date_from: e.target.value
                                    }))}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Дата до</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        date_to: e.target.value
                                    }))}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Badge bg="info" className="me-2">
                                        Всего: {compositions.length}
                                    </Badge>
                                    <Badge bg="primary">
                                        Отфильтровано: {filteredCompositions.length}
                                    </Badge>
                                </div>
                                <small className="text-muted">
                                    Автообновление каждые 5 секунд • Счётчик: {autoRefreshCount}
                                </small>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Список композиций */}
            <Card>
                <Card.Header>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                <i className="bi bi-list-ul me-2"></i>
                                Список заявок
                                <Badge bg="secondary" className="ms-2">
                                    {filteredCompositions.length}
                                </Badge>
                            </h5>
                        </Col>
                        <Col xs="auto">
                            <div className="d-flex align-items-center gap-2">
                                <div className="legend">
                                    <Badge bg="primary" className="me-1">Сформирована</Badge>
                                    <Badge bg="success" className="me-1">Завершена</Badge>
                                    <Badge bg="danger" className="me-1">Отклонена</Badge>
                                    <Badge bg="warning" className="me-1">Расчёт...</Badge>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body className="p-0">
                    {filteredCompositions.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                            <h5 className="mt-3 text-muted">Заявки не найдены</h5>
                            <p className="text-muted">Попробуйте изменить параметры фильтрации</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th style={{ width: '80px' }}>ID</th>
                                    <th style={{ width: '150px' }}>Статус</th>
                                    <th style={{ width: '120px' }}>Создатель</th>
                                    <th style={{ width: '150px' }}>Принадлежность</th>
                                    <th style={{ width: '120px' }}>Дата создания</th>
                                    <th style={{ width: '120px' }}>Обновлено</th>
                                    <th style={{ width: '180px' }}>Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredCompositions.map((composition) => (
                                    <tr key={composition.id}>
                                        <td>
                                            <strong className="text-primary">#{composition.id}</strong>
                                            {composition.title && (
                                                <div className="text-truncate small text-muted" style={{ maxWidth: '150px' }}
                                                     title={composition.title}>
                                                    {composition.title}
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            <Badge bg={getStatusVariant(composition.status)}
                                                   className="w-100 text-center">
                                                {composition.status}
                                            </Badge>
                                        </td>

                                        <td>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-person-circle me-2 text-muted"></i>
                                            </div>
                                        </td>

                                        <td>
                                            <Badge bg={getBelongingVariant(composition.belonging, composition.status)}
                                                   className="w-100 text-center">
                                                {getBelongingText(composition.belonging, composition.status)}
                                            </Badge>
                                        </td>

                                        <td>
                                            <div className="small">
                                                <div>{formatDate(composition.date_create)}</div>
                                                <div className="text-muted">
                                                    {new Date(composition.date_create).toLocaleTimeString('ru-RU', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="small">
                                                {formatDate(composition.date_update)}
                                                <div className="text-muted">
                                                    {new Date(composition.date_update).toLocaleTimeString('ru-RU', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(composition.id)}
                                                    title="Просмотреть детали"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>

                                                {composition.status === 'Сформирована' && (
                                                    <>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleCompleteClick(composition.id, composition.title)}
                                                            title="Завершить и запустить расчёт принадлежности"
                                                        >
                                                            <i className="bi bi-check-circle"></i>
                                                        </Button>

                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleReject(composition.id, composition.title)}
                                                            title="Отклонить"
                                                        >
                                                            <i className="bi bi-x-circle"></i>
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>

                <Card.Footer className="text-muted">
                    <Row className="align-items-center">
                        <Col>
                            <small>
                                <i className="bi bi-info-circle me-1"></i>
                                Принадлежность рассчитывается асинхронно в течение 5-10 секунд после завершения заявки
                            </small>
                        </Col>
                        <Col xs="auto">
                            <small>
                                <i className="bi bi-clock-history me-1"></i>
                                Автообновление: {pollingActive ? 'Включено' : 'Отключено'}
                            </small>
                        </Col>
                    </Row>
                </Card.Footer>
            </Card>

            {/* Модальное окно подтверждения завершения */}
            <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение завершения</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Вы уверены, что хотите завершить заявку <strong>"{selectedCompositionTitle}"</strong>?</p>
                    <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        После завершения будет автоматически запущен асинхронный расчёт принадлежности к классицизму.
                        Результат появится через 5-10 секунд.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="success" onClick={handleConfirmComplete}>
                        <i className="bi bi-check-circle me-1"></i>
                        Завершить и запустить расчёт
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModeratorCompositionsPage;