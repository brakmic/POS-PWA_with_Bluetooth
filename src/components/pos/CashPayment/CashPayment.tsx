import React, { useState } from 'react';
import './CashPayment.css';

interface CashPaymentProps {
  totalAmount: number;
  onSubmit: (amountReceived: number) => void;
  isProcessing: boolean;
}

const CashPayment: React.FC<CashPaymentProps> = ({ totalAmount, onSubmit, isProcessing }) => {
  const [amountReceived, setAmountReceived] = useState<string>(totalAmount.toFixed(2));
  const parsedAmount = parseFloat(amountReceived || '0');
  const change = Math.max(0, parsedAmount - totalAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount >= totalAmount) {
      onSubmit(parsedAmount);
    }
  };

  return (
    <div className="cash-payment">
      <h3>Cash Payment</h3>

      <form onSubmit={handleSubmit}>
        <div className="amount-row">
          <div className="amount-field">
            <label htmlFor="amount-due">Amount Due:</label>
            <div className="amount-value">${totalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="amount-row">
          <div className="amount-field">
            <label htmlFor="cash-received">Cash Received:</label>
            <input
              id="cash-received"
              type="number"
              min={totalAmount}
              step="0.01"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>
        </div>

        {parsedAmount >= totalAmount && (
          <div className="amount-row change">
            <div className="amount-field">
              <label>Change Due:</label>
              <div className="amount-value change-value">${change.toFixed(2)}</div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="complete-payment-button"
          disabled={parsedAmount < totalAmount || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Complete Cash Payment'}
        </button>
      </form>
    </div>
  );
};

export default CashPayment;
