import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/Home/HomePage';
import IntervalsPage from './pages/Intervals/IntervalsPage';
import IntervalDetailPage from './pages/IntervalDetail/IntervalDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Auth/ProfilePage';
import CompositionsPage from './pages/Compositions/CompositionsPage';
import CompositionDetailPage from './pages/Compositions/CompositionDetailPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ROUTES } from './utils/routes';
import './App.css';

function App() {
    return (
        <>
            <Navbar />
            <Container fluid className="app-container">
                <Routes>
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.INTERVALS} element={<IntervalsPage />} />
                    <Route path={ROUTES.INTERVAL_DETAIL} element={<IntervalDetailPage />} />

                    {/* Public auth routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/compositions"
                        element={
                            <ProtectedRoute>
                                <CompositionsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/compositions/:id"
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