import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDate } from '@utils/formatters';
import './Receipt.css';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productId: string;
}

interface VatBreakdownItem {
  rate: number;
  amount: number;
  categoryName: string;
}

const Receipt: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  if (!order) {
    return (
      <div className="receipt-page error">
        <h1>Receipt Not Found</h1>
        <p>The receipt information could not be found.</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleNewOrder = () => {
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="receipt-page">
      <div className="receipt-container">
        <div className="receipt-header">
          <h1>Receipt #{order.receiptNumber || order.id}</h1>
          <p className="date">{formatDate(new Date(order.timestamp))}</p>
        </div>

        <div className="receipt-details">
          <div className="receipt-info-row">
            <span>Order ID:</span>
            <span>{order.id}</span>
          </div>
          <div className="receipt-info-row">
            <span>Payment Method:</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="receipt-info-row">
            <span>Status:</span>
            <span className={`status-${order.status}`}>{order.status}</span>
          </div>
        </div>

        <div className="receipt-items">
          <h2>Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: OrderItem, index: number) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={3}>Total</td>
                <td>{formatCurrency(order.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* VAT information section */}
        <div className="receipt-summary">
          {/* Show subtotal if available, otherwise fall back to total amount */}
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal || order.totalAmount)}</span>
          </div>

          {/* Display VAT breakdown if available */}
          {order.vatBreakdown &&
            order.vatBreakdown.map((vat: VatBreakdownItem, index: number) => (
              <div className="summary-row vat-row" key={index}>
                <span>
                  VAT {(vat.rate * 100).toFixed(0)}% ({vat.categoryName}):
                </span>
                <span>{formatCurrency(vat.amount)}</span>
              </div>
            ))}

          <div className="summary-row total-row">
            <span>Total:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Thank you for your purchase!</p>
        </div>
      </div>

      <div className="receipt-actions">
        <button className="print-btn" onClick={handlePrint}>
          Print Receipt
        </button>
        <button className="new-order-btn" onClick={handleNewOrder}>
          New Order
        </button>
      </div>
    </div>
  );
};

export default Receipt;
