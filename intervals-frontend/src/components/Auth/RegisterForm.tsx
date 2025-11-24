import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';

const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        confirmPassword: '',
        is_moderator: false,
    });

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            dispatch(clearError());
            // Можно добавить обработку ошибки несовпадения паролей
            return;
        }

        const { confirmPassword, ...registerData } = formData;

        const result = await dispatch(registerUser(registerData));
        if (registerUser.fulfilled.match(result)) {
            navigate('/login', {
                state: { message: 'Регистрация успешна! Теперь вы можете войти.' }
            });
        }
    };

    return (
        <div className="auth-form">
            <h2 className="text-center mb-4">Регистрация</h2>

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
                        placeholder="Придумайте логин"
                        required
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Придумайте пароль"
                        required
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label>Подтверждение пароля</Form.Label>
                    <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Повторите пароль"
                        required
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Check
                        type="checkbox"
                        name="is_moderator"
                        label="Я модератор"
                        checked={formData.is_moderator}
                        onChange={handleChange}
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
                            Регистрация...
                        </>
                    ) : (
                        'Зарегистрироваться'
                    )}
                </Button>

                <div className="text-center">
                    <span>Уже есть аккаунт? </span>
                    <Link to="/login">Войти</Link>
                </div>
            </Form>
        </div>
    );
};

export default RegisterForm;