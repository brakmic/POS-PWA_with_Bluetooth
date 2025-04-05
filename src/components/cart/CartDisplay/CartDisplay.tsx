import React from 'react';
import { Cart as CartType } from '@appTypes/pos.types';
import './CartDisplay.css';

interface CartDisplayProps {
  cart: CartType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart?: () => void;
  onCheckout?: () => void;
  onContinueShopping?: () => void;
  mode: 'full' | 'compact';
}

const CartDisplay: React.FC<CartDisplayProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onContinueShopping,
  mode = 'full',
}) => {
  const isCompact = mode === 'compact';

  if (cart.items.length === 0) {
    return (
      <div className={`cart-display ${isCompact ? 'compact' : 'full'}`}>
        <div className="empty-cart-message">
          {isCompact ? (
            'Your cart is empty'
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
                <path d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2h7.45zM6.16 6h12.15l-2.76 5H8.53L6.16 6zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              <p>Your cart is empty</p>
              {onContinueShopping && (
                <button className="continue-shopping-button" onClick={onContinueShopping}>
                  Continue Shopping
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`cart-display ${isCompact ? 'compact' : 'full'}`}>
      <div className="cart-items">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              {!isCompact && <th>Price</th>}
              <th>Quantity</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item) => (
              <tr key={item.product.id} className="cart-item">
                <td className="product-info">
                  {!isCompact && (
                    <div className="product-image">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} />
                      ) : (
                        <div className="placeholder-image">
                          <span>{item.product.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="product-details">
                    <h3>{item.product.name}</h3>
                    {!isCompact && (
                      <p className="product-category">{item.product.category || 'Uncategorized'}</p>
                    )}
                  </div>
                </td>
                {!isCompact && <td className="product-price">${item.product.price.toFixed(2)}</td>}
                <td className="product-quantity">
                  <div className="quantity-controls">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="product-total">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </td>
                <td className="product-actions">
                  <button
                    className="remove-button"
                    onClick={() => onRemoveItem(item.product.id)}
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cart-totals">
        <div className="cart-total-row">
          <span>Total:</span>
          <span>${cart.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {!isCompact && onClearCart && onCheckout && onContinueShopping && (
        <div className="cart-actions">
          <button className="empty-cart-button" onClick={onClearCart}>
            Empty Cart
          </button>
          <button className="continue-button" onClick={onContinueShopping}>
            Continue Shopping
          </button>
          <button
            className="checkout-button"
            onClick={onCheckout}
            disabled={cart.items.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDisplay;
