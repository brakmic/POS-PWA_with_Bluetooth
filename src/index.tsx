import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { register as registerServiceWorker } from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { preloadProductImages } from './utils/imageCachePreloader';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline capabilities
registerServiceWorker();

// Trigger image preloading in development
if (process.env.NODE_ENV === 'development') {
  // Allow the app to render first, then preload images
  setTimeout(() => {
    preloadProductImages();
  }, 2000);
}

// Pass a function to log results (for example: reportWebVitals(console.log))
reportWebVitals();
