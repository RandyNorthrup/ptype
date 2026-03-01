/**
 * Performance Optimization Initialization
 */

import { resourcePreloader } from './resourcePreloader';
import { performanceMonitor } from './performanceMonitor';
import { info, debug } from './logger';

/**
 * Initialize all performance optimizations
 */
export async function initializePerformanceOptimizations() {
  info('Initializing performance optimizations', undefined, 'PerformanceInit');

  // Start performance monitoring in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    performanceMonitor.start();
    info('Performance monitoring active', undefined, 'PerformanceInit');
  }

  // Preload critical 3D assets
  await performanceMonitor.measureAsync('Critical Assets', async () => {
    await resourcePreloader.preloadCriticalAssets();
  });

  // Queue non-critical game assets for background loading
  resourcePreloader.queueAssets([
    '/assets/models/ships/enemy-fast.glb',
    '/assets/models/ships/enemy-boss.glb',
  ], 'medium');

  // Log initial cache stats
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    setTimeout(() => {
      debug('Initial Cache Stats', {
        resources: resourcePreloader.getCacheStats(),
      }, 'PerformanceInit');
    }, 1000);
  }

  info('Performance optimizations initialized', undefined, 'PerformanceInit');
}

/**
 * Get current performance status
 */
export function getPerformanceStatus() {
  const stats = performanceMonitor.getStats();
  const rating = performanceMonitor.getPerformanceRating();
  const memory = performanceMonitor.getMemoryUsageMB();
  const cacheStats = resourcePreloader.getCacheStats();

  return {
    fps: {
      current: Math.round(stats.current.fps),
      average: Math.round(stats.average.fps),
      min: Math.round(stats.min.fps),
      max: Math.round(stats.max.fps),
    },
    rating,
    memory,
    cache: cacheStats,
    isGood: rating === 'excellent' || rating === 'good',
  };
}
