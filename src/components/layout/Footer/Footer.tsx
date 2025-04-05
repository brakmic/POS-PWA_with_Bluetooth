import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} ACME Inc.</p>
        <p>Version 1.0.0</p>
      </div>
    </footer>
  );
};

export default Footer;
