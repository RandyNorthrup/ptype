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
});

// Service worker registration is handled by vite-plugin-pwa
// No manual registration needed

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
