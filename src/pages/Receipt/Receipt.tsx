import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '@utils/formatters';
import './Receipt.css';

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
              {order.items?.map((item: any, index: any) => (
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
