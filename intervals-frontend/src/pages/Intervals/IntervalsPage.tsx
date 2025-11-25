import { useEffect } from 'react'
import { Container, Spinner, Alert } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import { getIntervals, setFilters } from '../../store/slices/intervalsSlice'
import { getCompositionCart, addIntervalToComposition } from '../../store/slices/compositionsSlice'
import { useFilters } from '../../store/slices/filtersSlice'
import Filters from '../../components/Filters/Filters'
import IntervalCard from '../../components/IntervalCard/IntervalCard'
import { ROUTE_LABELS } from '../../utils/routes'
import './IntervalsPage.css'

const IntervalsPage = () => {
    const { intervals, loading, error } = useSelector((state: RootState) => state.intervals)
    const { cart } = useSelector((state: RootState) => state.compositions)
    const { isAuthenticated } = useSelector((state: RootState) => state.auth)
    const filtersFromStore = useFilters()
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        // Загружаем интервалы с текущими фильтрами
        dispatch(getIntervals(filtersFromStore))

        // Загружаем корзину для авторизованных пользователей
        if (isAuthenticated) {
            dispatch(getCompositionCart())
        }
    }, [dispatch, filtersFromStore, isAuthenticated])

    const handleFiltersChange = (filters: any) => {
        // Обновляем фильтры в store и загружаем интервалы
        dispatch(setFilters(filters))
        dispatch(getIntervals(filters))
    }

    const handleAddToCart = async (intervalId: number) => {
        if (!isAuthenticated) return

        try {
            await dispatch(
                addIntervalToComposition({ interval_id: intervalId, amount: 1 })
            ).unwrap()
        } catch (err: any) {
            console.error('Ошибка при добавлении в композицию:', err)
        }
    }

    const handleCartClick = () => {
        if (isAuthenticated && cart.compositionId) {
            window.location.href = `/compositions/${cart.compositionId}`
        }
    }

    return (
        <Container>
            <div className="page-header">
                <h1>{ROUTE_LABELS.INTERVALS}</h1>
                <p className="page-subtitle">
                    Изучите музыкальные интервалы - основные строительные блоки музыки
                </p>
            </div>

            <Filters onFiltersChange={handleFiltersChange} loading={loading} />

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {loading ? (
                <div className="loading-container">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Загрузка...</span>
                    </Spinner>
                    <p className="loading-text">Загрузка интервалов...</p>
                </div>
            ) : intervals.length === 0 ? (
                <div className="no-data-container">
                    <h3>Интервалы не найдены</h3>
                    <p>Попробуйте изменить параметры фильтрации</p>
                </div>
            ) : (
                <>
                    <div className="intervals-grid">
                        {intervals.map((interval) => (
                            <IntervalCard
                                key={interval.id}
                                interval={interval}
                                onAddToCart={
                                    isAuthenticated
                                        ? () => handleAddToCart(interval.id)
                                        : undefined
                                }
                            />
                        ))}
                    </div>

                    <div className="results-count">
                        <p className="text-muted">
                            Найдено интервалов: <strong>{intervals.length}</strong>
                        </p>
                    </div>
                </>
            )}

            {/* Иконка корзины (для всех пользователей) */}
            <div
                className={`loupe-icon ${
                    isAuthenticated && cart.itemCount > 0 ? 'active' : 'inactive'
                }`}
                onClick={handleCartClick}
            >
                <img
                    src={
                        isAuthenticated
                            ? cart.itemCount > 0
                                ? '/img/loupe.png'
                                : '/img/loupe_grey.png'
                            : '/img/loupe_grey.png'
                    }
                    alt="Корзина композиций"
                    className="loupe-image"
                />
                {isAuthenticated && cart.itemCount > 0 && (
                    <div className="loupe-count">{cart.itemCount}</div>
                )}
            </div>
        </Container>
    )
}

export default IntervalsPage
