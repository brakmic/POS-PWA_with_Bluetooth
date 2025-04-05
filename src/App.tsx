import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InversifyProvider } from './contexts/InversifyContext';
import { NetworkProvider } from '@contexts/NetworkContext';
import { BluetoothProvider } from '@contexts/BluetoothContext';
import { POSProvider } from '@contexts/POSContext';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import Store from '@pages/Store';
import Cart from '@pages/Cart';
import Checkout from '@pages/Checkout';
import Receipt from '@pages/Receipt';
import Settings from '@pages/Settings';
import ErrorPage from '@pages/ErrorPage';
import './App.css';

const App: React.FC = () => {
  return (
    <InversifyProvider>
      <NetworkProvider>
        <BluetoothProvider>
          <POSProvider>
            <BrowserRouter>
              <div className="app-container">
                <Header />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Store />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/receipt" element={<Receipt />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<ErrorPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </POSProvider>
        </BluetoothProvider>
      </NetworkProvider>
    </InversifyProvider>
  );
};

export default App;
