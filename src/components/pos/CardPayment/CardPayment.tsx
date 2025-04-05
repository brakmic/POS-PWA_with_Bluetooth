import React, { useState } from 'react';
import './CardPayment.css';

interface CardPaymentProps {
  onSubmit: (reference: string) => void;
  isProcessing: boolean;
}

const CardPayment: React.FC<CardPaymentProps> = ({ onSubmit, isProcessing }) => {
  const [cardInfo, setCardInfo] = useState({ cardNumber: '', cardholderName: '' });

  const isValidCardNumber = (number: string) => {
    const cleaned = number.replace(/\s|-/g, '');
    return /^\d{13,19}$/.test(cleaned);
  };

  const isValidName = (name: string) => {
    return name.trim().length >= 3;
  };

  const handleSubmit = () => {
    if (isValidCardNumber(cardInfo.cardNumber) && isValidName(cardInfo.cardholderName)) {
      onSubmit(`MANUAL-${Date.now()}`);
    }
  };

  return (
    <div className="card-payment">
      <h3>Card Payment</h3>
      <div className="card-form">
        <div className="form-group">
          <label htmlFor="card-number">Card Number</label>
          <input
            id="card-number"
            type="text"
            placeholder="XXXX XXXX XXXX XXXX"
            value={cardInfo.cardNumber}
            onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
            disabled={isProcessing}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cardholder-name">Cardholder Name</label>
          <input
            id="cardholder-name"
            type="text"
            placeholder="Name on card"
            value={cardInfo.cardholderName}
            onChange={(e) => setCardInfo({ ...cardInfo, cardholderName: e.target.value })}
            disabled={isProcessing}
          />
        </div>
        <button
          className="process-card-button"
          onClick={handleSubmit}
          disabled={
            isProcessing ||
            !isValidCardNumber(cardInfo.cardNumber) ||
            !isValidName(cardInfo.cardholderName)
          }
        >
          {isProcessing ? 'Processing...' : 'Process Card Payment'}
        </button>
      </div>
    </div>
  );
};

export default CardPayment;
