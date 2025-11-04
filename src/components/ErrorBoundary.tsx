/**
 * Production Error Boundary
 * Catches React errors and displays fallback UI
 */
import { Component, ErrorInfo, ReactNode } from 'react';
import { error as logError } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to tracking service
    logError('React Error Boundary caught error', error, 'ErrorBoundary');
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, send to error tracking service (Sentry, etc.)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Reload the page to reset state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0a0e1b 0%, #1a1f2e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
          }}
        >
          <div
            style={{
              background: 'rgba(10, 14, 27, 0.9)',
              border: '3px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '20px',
              padding: '3rem',
              maxWidth: '600px',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
            }}
          >
            <h1
              style={{
                color: '#ef4444',
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                textShadow: '0 0 20px rgba(239, 68, 68, 0.8)',
              }}
            >
              ⚠️ Oops! Something went wrong
            </h1>
            
            <p
              style={{
                color: '#94a3b8',
                fontSize: '1.1rem',
                marginBottom: '2rem',
                lineHeight: '1.6',
              }}
            >
              The game encountered an unexpected error. 
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <>
                  <br /><br />
                  <strong style={{ color: '#fbbf24' }}>Error:</strong> {this.state.error.message}
                </>
              )}
            </p>

            <button
              onClick={this.handleReset}
              style={{
                padding: '1rem 3rem',
                fontSize: '1.2rem',
                background: 'rgba(9, 255, 0, 0.15)',
                border: '2px solid #09ff00',
                borderRadius: '12px',
                color: '#09ff00',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(9, 255, 0, 0.4)',
                textShadow: '0 0 10px rgba(9, 255, 0, 0.8)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(9, 255, 0, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(9, 255, 0, 0.4)';
              }}
            >
              🔄 Reload Game
            </button>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details
                style={{
                  marginTop: '2rem',
                  textAlign: 'left',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#fbbf24' }}>
                  Stack Trace (Dev Only)
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
