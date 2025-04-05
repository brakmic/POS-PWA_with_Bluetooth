import React from 'react';
import './MobilePayment.css';

interface MobilePaymentProps {
  onSubmit: (reference: string) => void;
  isProcessing: boolean;
}

const MobilePayment: React.FC<MobilePaymentProps> = ({ onSubmit, isProcessing }) => {
  const handleSubmit = () => {
    onSubmit(`MOBILE-${Date.now()}`);
  };

  return (
    <div className="mobile-payment">
      <h3>Mobile Payment</h3>
      <div className="qr-code-container">
        <div className="qr-code-placeholder">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="160"
            height="160"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <rect x="7" y="7" width="3" height="3" />
            <rect x="14" y="7" width="3" height="3" />
            <rect x="7" y="14" width="3" height="3" />
            <rect x="14" y="14" width="3" height="3" />
          </svg>
        </div>
        <p className="instruction-text">Scan with your mobile device to pay</p>
      </div>
      <button className="process-mobile-button" onClick={handleSubmit} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Confirm Mobile Payment'}
      </button>
    </div>
  );
};

export default MobilePayment;
