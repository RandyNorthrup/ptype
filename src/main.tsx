/**
 * Main entry point for P-Type Web
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameStoreProvider } from './store/gameContext';
import App from './App';
import './index.css';
import { initializePerformanceOptimizations } from './utils/performanceInit';
import { error } from './utils/logger';

// Initialize performance optimizations
initializePerformanceOptimizations().catch(err => {
  error('Failed to initialize performance optimizations', err, 'Main');
  console.error('Performance optimization error:', err);
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.info('✅ Service Worker registered:', registration.scope);
      })
      .catch(err => {
        console.error('❌ Service Worker registration failed:', err);
      });
  });
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <GameStoreProvider>
          <App />
        </GameStoreProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
