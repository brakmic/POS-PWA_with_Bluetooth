import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '@contexts/POSContext';
import CartDisplay from '@components/cart/CartDisplay';
import './Cart.css';

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = usePOS();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleEmptyCart = () => {
    if (window.confirm('Are you sure you want to empty your cart?')) {
      clearCart();
    }
  };

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>

      <CartDisplay
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={handleEmptyCart}
        onCheckout={handleCheckout}
        onContinueShopping={handleContinueShopping}
        mode="full"
      />
    </div>
  );
};

export default Cart;
