import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePOS } from '@contexts/POSContext';
import { useNetwork } from '@contexts/NetworkContext';
import CartIcon from '@components/cart/CartIcon';
import NetworkStatusIndicator from '@components/common/NetworkStatusIndicator';
import './Header.css';

const Header: React.FC = () => {
  const { networkState } = useNetwork();
  const { cart } = usePOS();
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">POS</Link>
      </div>

      <nav className="main-nav">
        <ul>
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">Store</Link>
          </li>
          <li className={location.pathname === '/cart' ? 'active' : ''}>
            <Link to="/cart">Cart</Link>
          </li>
          <li className={location.pathname === '/settings' ? 'active' : ''}>
            <Link to="/settings">Settings</Link>
          </li>
        </ul>
      </nav>

      <div className="header-actions">
        <NetworkStatusIndicator />
        <CartIcon count={cart.items.length} totalAmount={cart.totalAmount} />
      </div>
    </header>
  );
};

export default Header;
