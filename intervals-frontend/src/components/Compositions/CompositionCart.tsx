import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { getCompositionCart } from '../../store/slices/compositionsSlice';

const CompositionCart: React.FC = () => {
    const { cart } = useSelector((state: RootState) => state.compositions);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleCartClick = () => {
        if (cart.compositionId) {
            navigate(`/compositions/${cart.compositionId}`);
        }
    };

    const handleRefreshCart = () => {
        dispatch(getCompositionCart());
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="composition-cart">
            <Button
                variant="outline-light"
                onClick={handleCartClick}
                disabled={!cart.compositionId}
                title={cart.compositionId ? 'Перейти к заявке' : 'Корзина пуста'}
                className="position-relative"
            >
                <i className="bi bi-cart3"></i> {/* Иконка корзины */}
                {cart.itemCount > 0 && (
                    <Badge
                        bg="danger"
                        className="position-absolute top-0 start-100 translate-middle"
                    >
                        {cart.itemCount}
                    </Badge>
                )}
            </Button>

            {/* Кнопка обновления корзины (можно убрать в продакшене) */}
            <Button
                variant="outline-light"
                size="sm"
                onClick={handleRefreshCart}
                className="ms-2"
                title="Обновить корзину"
            >
                <i className="bi bi-arrow-clockwise"></i>
            </Button>
        </div>
    );
};

export default CompositionCart;