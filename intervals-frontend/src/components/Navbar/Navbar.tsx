import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import { logoutUser } from '../../store/slices/authSlice' // Только logout
import { ROUTES, ROUTE_LABELS } from '../../utils/routes'
import './Navbar.css'

const Navbar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

    console.log('[NAVBAR] Render', {
        isAuthenticated,
        user,
        pathname: location.pathname,
        tokens: {
            accessToken: localStorage.getItem('accessToken') ? 'EXISTS' : 'NOT EXISTS',
            refreshToken: localStorage.getItem('refreshToken') ? 'EXISTS' : 'NOT EXISTS'
        }
    })

    // УБИРАЕМ автоматическое восстановление!
    // useEffect для восстановления профиля больше не нужен

    const handleLogout = async () => {
        console.log('[NAVBAR] Logout clicked')
        await dispatch(logoutUser())
        console.log('[NAVBAR] After logout:', {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken')
        })
        navigate('/')
    }

    const isActiveRoute = (route: string) => location.pathname === route

    return (
        <BSNavbar expand="lg" className="custom-navbar" variant="dark">
            <Container>
                <Link to={ROUTES.HOME} className="navbar-brand">
                    <img
                        src={import.meta.env.BASE_URL + 'img/image.png'}
                        width="60"
                        height="60"
                        className="d-inline-block align-top"
                        alt="Логотип База интервалов"
                    />
                    База интервалов
                </Link>

                <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BSNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link
                            as={Link}
                            to={ROUTES.INTERVALS}
                            className={isActiveRoute(ROUTES.INTERVALS) ? 'active' : ''}
                        >
                            {ROUTE_LABELS.INTERVALS}
                        </Nav.Link>

                        {isAuthenticated && (
                            <Nav.Link
                                as={Link}
                                to={ROUTES.COMPOSITIONS}
                                className={isActiveRoute(ROUTES.COMPOSITIONS) ? 'active' : ''}
                            >
                                {ROUTE_LABELS.COMPOSITIONS}
                            </Nav.Link>
                        )}
                    </Nav>

                    <Nav>
                        {isAuthenticated ? (
                            <>
                                <Nav.Link
                                    as={Link}
                                    to={ROUTES.PROFILE}
                                    className={isActiveRoute(ROUTES.PROFILE) ? 'active' : ''}
                                >
                                    {user?.login
                                        ? `${user.login} (${user.is_moderator ? 'Музыкальный эксперт' : 'Музыкальный аналитик'})`
                                        : 'Загрузка...'}
                                </Nav.Link>
                                <Button
                                    variant="outline-light"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="ms-2"
                                >
                                    Выйти
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Показываем кнопку "Войти" даже если токен есть в localStorage */}
                                <Nav.Link
                                    as={Link}
                                    to={ROUTES.LOGIN}
                                    className={isActiveRoute(ROUTES.LOGIN) ? 'active' : ''}
                                >
                                    {ROUTE_LABELS.LOGIN}
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to={ROUTES.REGISTER}
                                    className={isActiveRoute(ROUTES.REGISTER) ? 'active' : ''}
                                >
                                    {ROUTE_LABELS.REGISTER}
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </BSNavbar.Collapse>
            </Container>
        </BSNavbar>
    )
}

export default Navbar