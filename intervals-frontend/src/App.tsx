import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';

import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/Home/HomePage';
import IntervalsPage from './pages/Intervals/IntervalsPage';
import IntervalDetailPage from './pages/IntervalDetail/IntervalDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Auth/ProfilePage';
import CompositionsPage from './pages/Compositions/CompositionsPage';
import CompositionDetailPage from './pages/Compositions/CompositionDetailPage';
import LlmTestPage from './pages/LlmTestPage';

import ProtectedRoute from './components/common/ProtectedRoute';
import { ROUTES } from './utils/routes';
import { resetAuthState } from './store/slices/authSlice';

import './App.css';

function App() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        console.log('[APP] Resetting auth state on page load (F5)');
        console.log('[APP] Tokens before reset:', {
            accessToken: localStorage.getItem('accessToken') ? 'EXISTS' : 'NOT EXISTS',
            refreshToken: localStorage.getItem('refreshToken') ? 'EXISTS' : 'NOT EXISTS'
        });

        // Всегда сбрасываем состояние при загрузке страницы
        dispatch(resetAuthState());

        console.log('[APP] Tokens after reset (should still exist):', {
            accessToken: localStorage.getItem('accessToken') ? 'EXISTS' : 'NOT EXISTS',
            refreshToken: localStorage.getItem('refreshToken') ? 'EXISTS' : 'NOT EXISTS'
        });
        if (localStorage.getItem('loglevel')) {
            localStorage.removeItem('loglevel');
        }
    }, [dispatch]);

    return (
        <>
            <Navbar />
            <Container fluid className="app-container">
                <Routes>
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.INTERVALS} element={<IntervalsPage />} />
                    <Route path={ROUTES.INTERVAL_DETAIL} element={<IntervalDetailPage />} />
                    <Route path={ROUTES.ASSISTANT_TEST} element={<LlmTestPage />} />

                    {/* Public auth routes - всегда доступны */}
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

                    {/* Protected routes - требуют явного входа */}
                    <Route
                        path={ROUTES.PROFILE}
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.COMPOSITIONS}
                        element={
                            <ProtectedRoute>
                                <CompositionsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.COMPOSITION_DETAIL}
                        element={
                            <ProtectedRoute>
                                <CompositionDetailPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Container>
        </>
    );
}

export default App;