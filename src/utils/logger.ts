/**
 * Centralized Logging and Error Tracking System
 * Replaces all console.* calls with proper error tracking
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private isDevelopment: boolean;
  private errorCallbacks: Array<(error: Error, context?: string) => void> = [];

  constructor() {
    this.isDevelopment = typeof window !== 'undefined' && 
                         window.location.hostname === 'localhost';
    
    // Expose logger in development for debugging
    if (this.isDevelopment && typeof window !== 'undefined') {
      (window as any).__logger = this;
    }
  }

  /**
   * Register callback for error tracking (e.g., Sentry)
   */
  onError(callback: (error: Error, context?: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Debug level - only in development
   */
  debug(message: string, data?: any, context?: string): void {
    if (this.isDevelopment) {
      this.log('debug', message, data, context);
    }
  }

  /**
   * Info level - general information
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Warning level - something unexpected but not critical
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Error level - critical issues that need attention
   */
  error(message: string, error?: Error | any, context?: string): void {
    this.log('error', message, error, context);
    
    // Trigger error callbacks for external tracking
    if (error instanceof Error) {
      this.errorCallbacks.forEach(cb => cb(error, context));
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      data,
    };

    // Store in memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Only output to console in development
    if (this.isDevelopment) {
      const prefix = context ? `[${context}]` : '';
      const emoji = this.getEmoji(level);
      
      switch (level) {
        case 'debug':
          console.debug(`${emoji} ${prefix} ${message}`, data || '');
          break;
        case 'info':
          console.info(`${emoji} ${prefix} ${message}`, data || '');
          break;
        case 'warn':
          console.warn(`${emoji} ${prefix} ${message}`, data || '');
          break;
        case 'error':
          console.error(`${emoji} ${prefix} ${message}`, data || '');
          break;
      }
    }
  }

  /**
   * Get emoji for log level
   */
  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🔍';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
    }
  }

  /**
   * Get all logs (for debugging)
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get error count
   */
  getErrorCount(): number {
    return this.logs.filter(log => log.level === 'error').length;
  }

  /**
   * Get warning count
   */
  getWarningCount(): number {
    return this.logs.filter(log => log.level === 'warn').length;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const debug = (message: string, data?: any, context?: string) => 
  logger.debug(message, data, context);

export const info = (message: string, data?: any, context?: string) => 
  logger.info(message, data, context);

export const warn = (message: string, data?: any, context?: string) => 
  logger.warn(message, data, context);

export const error = (message: string, err?: Error | any, context?: string) => 
  logger.error(message, err, context);
