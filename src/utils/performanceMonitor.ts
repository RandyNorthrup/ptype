/**
 * Performance Monitor - Track FPS, memory usage, and render times
 */
import { debug } from './logger';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  drawCalls?: number;
  triangles?: number;
}

interface PerformanceStats {
  current: PerformanceMetrics;
  average: PerformanceMetrics;
  min: PerformanceMetrics;
  max: PerformanceMetrics;
}

class PerformanceMonitor {
  private enabled: boolean = false;
  private frames: number[] = [];
  private maxFrames = 60;
  private lastTime = performance.now();
  private frameCount = 0;
  private callbacks: ((stats: PerformanceStats) => void)[] = [];
  
  // Statistics
  private stats: PerformanceStats = {
    current: this.getEmptyMetrics(),
    average: this.getEmptyMetrics(),
    min: this.getEmptyMetrics(),
    max: this.getEmptyMetrics(),
  };

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      frameTime: 0,
      memory: undefined,
      drawCalls: 0,
      triangles: 0,
    };
  }

  /**
   * Start monitoring performance
   */
  start() {
    if (this.enabled) return;
    this.enabled = true;
    this.lastTime = performance.now();
    this.update();
    // Logging handled by update method
  }

  /**
   * Stop monitoring performance
   */
  stop(): void {
    this.enabled = false;
    // Stop handled by enabled flag
  }

  /**
   * Update performance metrics
   */
  private update = () => {
    if (!this.enabled) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    // Calculate FPS
    const fps = 1000 / deltaTime;
    this.frames.push(fps);
    
    // Keep only last N frames
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
    
    // Update current metrics
    this.stats.current.fps = fps;
    this.stats.current.frameTime = deltaTime;
    
    // Get memory info if available
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.stats.current.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    
    // Calculate average
    const avgFps = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    this.stats.average.fps = avgFps;
    
    // Calculate min/max
    this.stats.min.fps = Math.min(...this.frames);
    this.stats.max.fps = Math.max(...this.frames);
    
    // Notify callbacks every 60 frames (about once per second at 60fps)
    this.frameCount++;
    if (this.frameCount >= 60) {
      this.frameCount = 0;
      this.notifyCallbacks();
    }
    
    this.lastTime = currentTime;
    requestAnimationFrame(this.update);
  };

  /**
   * Subscribe to performance updates
   */
  subscribe(callback: (stats: PerformanceStats) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers
   */
  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.stats));
  }

  /**
   * Get current statistics
   */
  getStats(): PerformanceStats {
    return { ...this.stats };
  }

  /**
   * Get memory usage in MB
   */
  getMemoryUsageMB(): number {
    if (this.stats.current.memory) {
      return Math.round(this.stats.current.memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  /**
   * Check if performance is acceptable (>= 30 FPS)
   */
  isPerformanceGood(): boolean {
    return this.stats.average.fps >= 30;
  }

  /**
   * Get performance rating
   */
  getPerformanceRating(): 'excellent' | 'good' | 'fair' | 'poor' {
    const fps = this.stats.average.fps;
    if (fps >= 55) return 'excellent';
    if (fps >= 40) return 'good';
    if (fps >= 25) return 'fair';
    return 'poor';
  }

  /**
   * Log current stats
   */
  logStats(): void {
    const rating = this.getPerformanceRating();
    const memory = this.getMemoryUsageMB();
    
    debug('Performance Stats', {
      rating,
      currentFPS: this.stats.current.fps.toFixed(1),
      averageFPS: this.stats.average.fps.toFixed(1),
      minFPS: this.stats.min.fps.toFixed(1),
      maxFPS: this.stats.max.fps.toFixed(1),
      frameTime: this.stats.current.frameTime.toFixed(2) + 'ms',
      memoryMB: memory || 'N/A'
    }, 'PerformanceMonitor');
  }

  /**
   * Measure execution time of a function
   */
  async measureAsync(label: string, fn: () => Promise<void>): Promise<void> {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;
    debug(`Measure Async: ${label}`, { duration: duration.toFixed(2) + 'ms' }, 'PerformanceMonitor');
  }

  /**
   * Measure synchronous function execution time
   */
  measure(label: string, fn: () => void): void {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;
    debug(`Measure: ${label}`, { duration: duration.toFixed(2) + 'ms' }, 'PerformanceMonitor');
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  performanceMonitor.start();
  
  // Log summary every 10 seconds in dev
  setInterval(() => {
    performanceMonitor.logStats();
  }, 10000);
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__performanceMonitor = performanceMonitor;
}
