import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

export interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
  onReset?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  code = 404,
  title = 'Page Not Found',
  message = 'The requested page does not exist.',
  onReset,
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onReset) {
      onReset();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="error-page">
      <div className="error-code">{code}</div>
      <h1 className="error-title">{title}</h1>
      <p className="error-message">{message}</p>
      <button className="back-link" onClick={handleBackClick}>
        {onReset ? 'Try Again' : 'Return to Home'}
      </button>
    </div>
  );
};

export default ErrorPage;
