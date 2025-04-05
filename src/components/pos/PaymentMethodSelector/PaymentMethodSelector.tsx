import React from 'react';
import { PaymentMethod } from '@appTypes/pos.types';
import './PaymentMethodSelector.css';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  availableMethods?: PaymentMethod[];
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  availableMethods = ['cash', 'card', 'mobile'],
}) => {
  const methodsInfo = {
    cash: {
      label: 'Cash',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M17 6v12" />
          <path d="M7 6v12" />
        </svg>
      ),
    },
    card: {
      label: 'Card',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="4" y1="15" x2="7" y2="15" />
          <line x1="10" y1="15" x2="14" y2="15" />
        </svg>
      ),
    },
    mobile: {
      label: 'Mobile',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
          <path d="M8 2v2h8V2" />
        </svg>
      ),
    },
  };

  return (
    <div className="payment-method-selector">
      <h3>Select Payment Method</h3>
      <div className="payment-methods-grid">
        {availableMethods.map((method) => (
          <button
            key={method}
            className={`payment-method-option ${selectedMethod === method ? 'selected' : ''}`}
            onClick={() => onSelectMethod(method)}
            type="button"
          >
            <div className="payment-method-icon">{methodsInfo[method].icon}</div>
            <span className="payment-method-label">{methodsInfo[method].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
