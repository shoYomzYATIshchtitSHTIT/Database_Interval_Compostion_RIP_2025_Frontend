import { useEffect, useState } from 'react' // добавляем useState
import { Container, Spinner, Alert, Pagination, Button } from 'react-bootstrap' // добавляем Button
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState, AppDispatch } from '../../store'
import {
    getIntervals,
    setFilters,
    setPage
} from '../../store/slices/intervalsSlice'
import { getCompositionCart, addIntervalToComposition } from '../../store/slices/compositionsSlice'
import { useFilters } from '../../store/slices/filtersSlice'
import Filters from '../../components/Filters/Filters'
import IntervalCard from '../../components/IntervalCard/IntervalCard'
import AssistantModal from '../../components/llm/AssistantModal' // новый импорт
import { useIntervalsContext } from '../../hooks/useIntervalsContext' // новый импорт
import { ROUTE_LABELS } from '../../utils/routes'
import './IntervalsPage.css'

const IntervalsPage = () => {
    const {
        intervals,
        loading,
        error,
        pagination
    } = useSelector((state: RootState) => state.intervals);

    const { cart } = useSelector((state: RootState) => state.compositions);
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const filtersFromStore = useFilters();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { currentPage, pageSize, totalItems, totalPages } = pagination;

    // Состояние для ассистента
    const [showAssistant, setShowAssistant] = useState(false);

    // Получаем контекст для ассистента
    const intervalsContext = useIntervalsContext({
        intervals,
        filters: filtersFromStore,
        pagination: pagination
    });

    // Логируем каждый рендер
    console.log('[INTERVALS PAGE] Render', {
        isAuthenticated,
        intervals: intervals.length,
        pagination,
        cart
    });

    useEffect(() => {
        console.log('[INTERVALS PAGE] Загрузка с серверной пагинацией', {
            filtersFromStore,
            currentPage,
            pageSize
        });

        // Загружаем ТОЛЬКО нужную страницу с сервера
        dispatch(getIntervals({
            filters: filtersFromStore,
            page: currentPage,
            pageSize: 8
        }));

        // Загружаем корзину
        if (isAuthenticated) {
            dispatch(getCompositionCart());
        }
    }, [dispatch, filtersFromStore, currentPage, pageSize, isAuthenticated]);

    const handleFiltersChange = (filters: any) => {
        console.log('[INTERVALS PAGE] Filters changed', filters);
        dispatch(setFilters(filters));
        // Страница сбросится на 1 в reducer
    };

    const handlePageChange = (pageNumber: number) => {
        console.log('[INTERVALS PAGE] Page change to', pageNumber);
        dispatch(setPage(pageNumber));
    };

    const handleAddToCart = async (intervalId: number) => {
        if (!isAuthenticated) {
            console.log('[INTERVALS PAGE] User not authenticated, cannot add to cart');
            return;
        }

        try {
            await dispatch(
                addIntervalToComposition({ interval_id: intervalId, amount: 1 })
            ).unwrap();
            console.log('[INTERVALS PAGE] Interval added to cart', intervalId);
        } catch (err: any) {
            console.error('[INTERVALS PAGE] Error adding to composition:', err);
        }
    };

    const handleCartClick = () => {
        console.log('[INTERVALS PAGE] Cart clicked', { isAuthenticated, cart });
        if (isAuthenticated && cart.compositionId) {
            navigate(`/compositions/${cart.compositionId}`);
            console.log('[INTERVALS PAGE] Navigating to composition', cart.compositionId);
        } else {
            console.log('[INTERVALS PAGE] Navigation blocked: not authenticated or empty cart');
        }
    };

    // Создаем элементы пагинации
    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Кнопка "Первая"
        items.push(
            <Pagination.First
                key="first"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
            />
        );

        // Кнопка "Предыдущая"
        items.push(
            <Pagination.Prev
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            />
        );

        // Пропуск в начале
        if (startPage > 1) {
            items.push(
                <Pagination.Ellipsis key="ellipsis-start" disabled />
            );
        }

        // Нумерованные страницы
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        // Пропуск в конце
        if (endPage < totalPages) {
            items.push(
                <Pagination.Ellipsis key="ellipsis-end" disabled />
            );
        }

        // Кнопка "Следующая"
        items.push(
            <Pagination.Next
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            />
        );

        // Кнопка "Последняя"
        items.push(
            <Pagination.Last
                key="last"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
            />
        );

        return items;
    };

    return (
        <Container>
            <div className="page-header">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h1>{ROUTE_LABELS.INTERVALS}</h1>
                        <p className="page-subtitle">
                            Изучите музыкальные интервалы - основные строительные блоки музыки
                        </p>
                    </div>

                    {/* Кнопка ассистента - для всех пользователей */}
                    <Button
                        variant="outline-primary"
                        onClick={() => setShowAssistant(true)}
                        className="assistant-button"
                        size="sm"
                    >
                        <span style={{ marginRight: '8px' }}>🤖</span>
                        Спросить ассистента
                    </Button>
                </div>
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

                    <div className="pagination-container d-flex justify-content-between align-items-center mt-4 mb-4">
                        <div className="results-count">
                            <p className="text-muted mb-0">
                                Показано <strong>{intervals.length}</strong> из <strong>{totalItems}</strong> интервалов
                            </p>
                            <p className="text-muted mb-0">
                                Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
                            </p>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination-wrapper">
                                <Pagination className="mb-0">
                                    {renderPaginationItems()}
                                </Pagination>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Иконка корзины (для всех пользователей) */}
            <div
                className={`loupe-icon ${isAuthenticated && cart.itemCount > 0 ? 'active' : 'inactive'}`}
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

            {/* Модальное окно ассистента */}
            <AssistantModal
                show={showAssistant}
                onHide={() => setShowAssistant(false)}
                intervalsContext={intervalsContext}
                userInfo={{
                    isAuthenticated,
                    name: user?.login
                }}
            />
        </Container>
    );
};

export default IntervalsPage;