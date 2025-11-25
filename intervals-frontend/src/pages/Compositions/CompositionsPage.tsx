import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { getCompositions, getCompositionCart } from '../../store/slices/compositionsSlice';

const CompositionsPage: React.FC = () => {
    const { compositions, loading, error } = useSelector((state: RootState) => state.compositions);
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        status: '',
        date_from: '',
        date_to: '',
    });

    const isModerator = user?.is_moderator;

    // ---------- Load compositions ----------
    useEffect(() => {
        const query: any = { ...filters };
        if (!isModerator) {
            query.creator_id = user?.id; // показываем только заявки текущего пользователя
        }
        dispatch(getCompositions(query));
        dispatch(getCompositionCart());
    }, [dispatch, filters, user, isModerator]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleCompositionClick = (id: number) => {
        navigate(`/compositions/${id}`);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Черновик': return 'secondary';
            case 'Сформирована': return 'primary';
            case 'Завершена': return 'success';
            case 'Отклонена': return 'danger';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    // ---------- Фильтруем и сортируем для обычного пользователя ----------
    const displayedCompositions = React.useMemo(() => {
        let list = compositions;

        // Для обычного пользователя оставляем только свои композиции
        if (!isModerator) {
            list = list.filter(c => c.creator_id === user?.id);
        }

        // Черновики выше
        list.sort((a, b) => {
            if (a.status === 'Черновик' && b.status !== 'Черновик') return -1;
            if (a.status !== 'Черновик' && b.status === 'Черновик') return 1;
            // затем по дате создания
            return new Date(b.date_create).getTime() - new Date(a.date_create).getTime();
        });

        return list;
    }, [compositions, user, isModerator]);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1>Мои композиции</h1>
                    <p className="text-muted">
                        {isModerator ? 'Управление всеми композициями системы' : 'Управление вашими музыкальными композициями'}
                    </p>
                </Col>
            </Row>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* Фильтры */}
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">Фильтры</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <div className="mb-3">
                                <label className="form-label">Статус</label>
                                <select
                                    className="form-select"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">Все статусы</option>
                                    <option value="Черновик">Черновик</option>
                                    <option value="Сформирована">Сформирована</option>
                                    <option value="Завершена">Завершена</option>
                                    <option value="Отклонена">Отклонена</option>
                                </select>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="mb-3">
                                <label className="form-label">Дата от</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="mb-3">
                                <label className="form-label">Дата до</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
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
                            <h5 className="mb-0">{isModerator ? 'Все композиции системы' : 'Список композиций'}</h5>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => dispatch(getCompositions(filters))}
                            >
                                Обновить
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    {displayedCompositions.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">Композиции не найдены</p>
                            <Button variant="outline-primary" onClick={() => navigate('/intervals')}>
                                Перейти к интервалам
                            </Button>
                        </div>
                    ) : (
                        <Table responsive>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Статус</th>
                                {isModerator && <th>Создатель</th>}
                                <th>Дата создания</th>
                                <th>Дата обновления</th>
                                <th>Принадлежность</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {displayedCompositions.map((composition) => (
                                <tr key={composition.id}>
                                    <td>{composition.id}</td>
                                    <td>
                                        <Badge bg={getStatusVariant(composition.status)}>
                                            {composition.status}
                                        </Badge>
                                    </td>
                                    {isModerator && (
                                        <td>
                                            {composition.creator_id === user?.id ? 'Вы' : `ID: ${composition.creator_id}`}
                                        </td>
                                    )}
                                    <td>{formatDate(composition.date_create)}</td>
                                    <td>{formatDate(composition.date_update)}</td>
                                    <td>{composition.belonging || '-'}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleCompositionClick(composition.id)}
                                        >
                                            Просмотреть
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CompositionsPage;
