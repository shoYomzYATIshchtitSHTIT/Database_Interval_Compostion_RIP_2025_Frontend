import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { getCompositions, getCompositionCart } from '../../store/slices/compositionsSlice';

const CompositionsPage: React.FC = () => {
    const { compositions, loading, error } = useSelector((state: RootState) => state.compositions);
    const { user } = useSelector((state: RootState) => state.auth); // Оставляем для будущих проверок прав
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        status: '',
        date_from: '',
        date_to: '',
    });

    useEffect(() => {
        dispatch(getCompositions(filters));
        dispatch(getCompositionCart());
    }, [dispatch, filters]);

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

    // Добавляем проверку, является ли пользователь модератором для отображения дополнительной информации
    const isModerator = user?.is_moderator;

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
                    <h1>Мои заявки</h1>
                    <p className="text-muted">
                        {isModerator ? 'Управление всеми заявками системы' : 'Управление вашими музыкальными композициями'}
                    </p>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

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

            {/* Список заявок */}
            <Card>
                <Card.Header>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                {isModerator ? 'Все заявки системы' : 'Список заявок'}
                            </h5>
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
                    {compositions.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">Заявки не найдены</p>
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
                            {compositions.map((composition) => (
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