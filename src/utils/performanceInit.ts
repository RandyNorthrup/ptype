/**
 * Performance Optimization Initialization
 * This file demonstrates how to use all performance utilities together
 */

import { resourcePreloader } from './resourcePreloader';
import { performanceMonitor } from './performanceMonitor';
import { imageOptimizer } from './imageOptimizer';
import { info, warn, debug } from './logger';

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

  // Preload UI images in background
  const uiImages = [
    '/assets/icons/health.png',
    '/assets/icons/shield.png',
    '/assets/icons/score.png',
  ];
  
  imageOptimizer.preloadImages(uiImages).catch(err => {
    warn('Failed to preload UI images', err, 'PerformanceInit');
  });

  // Queue non-critical game assets for background loading
  resourcePreloader.queueAssets([
    '/assets/models/ships/enemy-fast.glb',
    '/assets/models/ships/enemy-boss.glb',
  ], 'medium');

  // Log initial cache stats
  if (window.location.hostname === 'localhost') {
    setTimeout(() => {
      debug('Initial Cache Stats', {
        resources: resourcePreloader.getCacheStats(),
        images: imageOptimizer.getCacheStats()
      }, 'PerformanceInit');
    }, 1000);
  }

  info('Performance optimizations initialized', undefined, 'PerformanceInit');
}

/**
 * Cleanup when returning to menu
 */
export function cleanupGameAssets() {
  debug('Cleaning up non-critical assets', undefined, 'PerformanceInit');
  resourcePreloader.clearNonCriticalAssets();
  
  if (window.location.hostname === 'localhost') {
    debug('Cache after cleanup', resourcePreloader.getCacheStats(), 'PerformanceInit');
  }
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

/**
 * Check if performance optimizations should be applied
 */
export function shouldApplyOptimizations(): boolean {
  const status = getPerformanceStatus();
  
  // Apply optimizations if performance is not excellent
  if (status.rating !== 'excellent') {
    info('Performance optimizations recommended', { rating: status.rating }, 'PerformanceInit');
    return true;
  }
  
  return false;
}

/**
 * Apply emergency optimizations if performance drops
 */
export function applyEmergencyOptimizations() {
  warn('Applying emergency performance optimizations', undefined, 'PerformanceInit');
  
  // Clear non-critical assets
  resourcePreloader.clearNonCriticalAssets();
  
  // Clear image cache
  imageOptimizer.clearCache();
  
  info('Emergency optimizations applied', undefined, 'PerformanceInit');
}

// Expose utilities globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__perfUtils = {
    init: initializePerformanceOptimizations,
    cleanup: cleanupGameAssets,
    status: getPerformanceStatus,
    emergency: applyEmergencyOptimizations,
  };
}
