import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOS } from '@contexts/POSContext';
import CartDisplay from '@components/cart/CartDisplay';
import PaymentMethodSelector from '@components/pos/PaymentMethodSelector';
import CashPayment from '@components/pos/CashPayment';
import CardPayment from '@components/pos/CardPayment';
import MobilePayment from '@components/pos/MobilePayment';
import { PaymentMethod, PaymentDetails } from '@appTypes/pos.types';
import './Checkout.css';

const Checkout: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, checkout } = usePOS();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Reset processing state when payment method changes
    setIsProcessing(false);
  }, [paymentMethod]);

  // Redirect to Home if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      // Show a brief message before redirecting
      const timeout = setTimeout(() => {
        navigate('/');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [cart.items.length, navigate]);

  // Handle different payment methods
  const handlePayment = async (paymentDetails: PaymentDetails) => {
    setIsProcessing(true);

    try {
      const order = await checkout({
        method: paymentDetails.method,
        amount: cart.totalAmount,
        reference: paymentDetails.reference,
        timestamp: new Date().toISOString(),
      });

      if (order) {
        navigate('/receipt', { state: { order } });
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generic payment completion handler
  const handlePaymentComplete = (method: PaymentMethod) => (reference: string) => {
    handlePayment({
      method,
      reference,
    });
  };

  // Process cash payment
  const handleCashPayment = (amountReceived: number) => {
    handlePayment({
      method: 'cash',
      reference: `CASH-${Date.now()}`,
      amountReceived,
    });
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Cart summary section */}
      <CartDisplay
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        mode="compact"
      />

      {/* Payment method selection */}
      <PaymentMethodSelector selectedMethod={paymentMethod} onSelectMethod={setPaymentMethod} />

      {/* Payment form based on selected method */}
      <div className="payment-details">
        {paymentMethod === 'cash' && (
          <CashPayment
            totalAmount={cart.totalAmount}
            onSubmit={handleCashPayment}
            isProcessing={isProcessing}
          />
        )}

        {paymentMethod === 'card' && (
          <CardPayment onSubmit={handlePaymentComplete('card')} isProcessing={isProcessing} />
        )}

        {paymentMethod === 'mobile' && (
          <MobilePayment onSubmit={handlePaymentComplete('mobile')} isProcessing={isProcessing} />
        )}
      </div>

      {/* Cancel button */}
      <div className="checkout-actions">
        <button className="back-button" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Checkout;
