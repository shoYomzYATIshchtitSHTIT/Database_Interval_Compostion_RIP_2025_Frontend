import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';

const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await dispatch(loginUser(formData));
        if (loginUser.fulfilled.match(result)) {
            navigate('/intervals');
        }
    };

    return (
        <div className="auth-form">
            <h2 className="text-center mb-4">Вход в систему</h2>

            {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                    {error}
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Логин</Form.Label>
                    <Form.Control
                        type="text"
                        name="login"
                        value={formData.login}
                        onChange={handleChange}
                        placeholder="Введите ваш логин"
                        required
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Введите ваш пароль"
                        required
                        disabled={loading}
                    />
                </Form.Group>

                <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Вход...
                        </>
                    ) : (
                        'Войти'
                    )}
                </Button>

                <div className="text-center">
                    <span>Нет аккаунта? </span>
                    <Link to="/register">Зарегистрироваться</Link>
                </div>
            </Form>
        </div>
    );
};

export default LoginForm;