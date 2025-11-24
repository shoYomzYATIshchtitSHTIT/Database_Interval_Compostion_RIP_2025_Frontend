import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

const ProfilePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    if (!user) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <p>Пожалуйста, войдите в систему</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Header>
                            <h3 className="mb-0">Личный кабинет</h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-4">
                                <h5>Информация о пользователе</h5>
                                <p><strong>Логин:</strong> {user.login}</p>
                                <p><strong>Роль:</strong> {user.is_moderator ? 'Модератор' : 'Пользователь'}</p>
                            </div>

                            <div className="d-grid gap-2">
                                <Button variant="primary">
                                    Изменить данные
                                </Button>
                                <Button variant="outline-danger" onClick={handleLogout}>
                                    Выйти из системы
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;