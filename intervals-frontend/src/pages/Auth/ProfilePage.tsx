import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { updateProfile } from '../../store/slices/authSlice'; // thunk для обновления профиля

const ProfilePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [login, setLogin] = useState(user?.login || '');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await dispatch(updateProfile({ login, password })).unwrap();
            setSuccess('Данные успешно обновлены');
            setPassword('');
            setIsEditing(false); // закрываем форму после сохранения
        } catch (err: any) {
            setError(err || 'Ошибка обновления данных');
        }
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
                            {success && <Alert variant="success">{success}</Alert>}
                            {error && <Alert variant="danger">{error}</Alert>}

                            {isEditing ? (
                                <Form onSubmit={handleUpdate}>
                                    <Form.Group className="mb-3" controlId="formLogin">
                                        <Form.Label>Логин</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={login}
                                            onChange={(e) => setLogin(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formPassword">
                                        <Form.Label>Новый пароль</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Оставьте пустым, если не хотите менять"
                                        />
                                    </Form.Group>

                                    <div className="d-grid gap-2 mb-3">
                                        <Button type="submit" variant="primary">
                                            Сохранить изменения
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Отмена
                                        </Button>
                                    </div>
                                </Form>
                            ) : (
                                <div className="mb-4">
                                    <h5>Информация о пользователе</h5>
                                    <p><strong>Логин:</strong> {user.login}</p>
                                    <p><strong>Роль:</strong> {user.is_moderator ? 'Музыкальный эксперт' : 'Музыкальный аналитик'}</p>
                                    <div className="d-grid gap-2">
                                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                                            Изменить данные
                                        </Button>
                                        <Button variant="outline-danger" onClick={handleLogout}>
                                            Выйти из системы
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
