/**
 * Main entry point for P-Type Web
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GameStoreProvider } from "./store/gameContext";
import App from "./App";
import "./index.css";
import { initializePerformanceOptimizations } from "./utils/performanceInit";
import { error } from "./utils/logger";

async function bootstrap(): Promise<void> {
  try {
    await initializePerformanceOptimizations();
  } catch (error_: unknown) {
    error("Failed to initialize performance optimizations", error_, "Main");
  }

  const root = document.querySelector("#root");
  if (!root) {
    error("Root element was not found", undefined, "Main");
    return;
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <GameStoreProvider>
          <App />
        </GameStoreProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

// Service worker registration is handled by vite-plugin-pwa.
void bootstrap();
