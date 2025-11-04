/**
 * Main entry point for P-Type Web
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializePerformanceOptimizations } from './utils/performanceInit';
import { error } from './utils/logger';

// Initialize performance optimizations
initializePerformanceOptimizations().catch(err => {
  error('Failed to initialize performance optimizations', err, 'Main');
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, but app should still work
    });
  });
}

import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
