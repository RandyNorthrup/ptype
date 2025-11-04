/**
 * Resource Preloader - Manages asset loading priority and memory with intelligent caching
 */
import { useGLTF } from '@react-three/drei';
import { performanceMonitor } from './performanceMonitor';
import { info, warn, debug } from './logger';

interface CacheEntry {
  path: string;
  size: number;
  lastAccess: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

class ResourcePreloader {
  private loadedAssets = new Map<string, CacheEntry>();
  private loadingQueue: Array<{ path: string; priority: number }> = [];
  private maxConcurrent = 3;
  private maxCacheSize = 100 * 1024 * 1024; // 100MB cache limit
  private currentCacheSize = 0;
  private isProcessing = false;

  // Asset priorities
  private readonly PRIORITY = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  /**
   * Preload critical assets first with performance tracking
   */
  async preloadCriticalAssets(): Promise<void> {
    return performanceMonitor.measureAsync('Critical Assets Load', async () => {
      const critical = [
        '/assets/models/ships/player-ship.glb',
        '/assets/models/ships/enemy-basic.glb',
        '/assets/fonts/Orbitron-Regular.ttf'
      ];

      // Preload in parallel with priority
      await Promise.all(critical.map(asset => 
        this.preloadAsset(asset, 'critical')
      ));

      info('Critical assets preloaded', undefined, 'resourcePreloader');
    });
  }

  /**
   * Preload an asset with priority
   */
  private async preloadAsset(
    path: string, 
    priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    // Check if already loaded
    const existing = this.loadedAssets.get(path);
    if (existing) {
      existing.lastAccess = Date.now();
      return;
    }

    try {
      let estimatedSize = 0;

      if (path.endsWith('.glb')) {
        // Preload 3D model
        useGLTF.preload(path);
        estimatedSize = 500 * 1024; // Estimate 500KB per model
      } else if (path.endsWith('.ttf') || path.endsWith('.woff2')) {
        // Preload font
        await this.preloadFont(path);
        estimatedSize = 100 * 1024; // Estimate 100KB per font
      } else if (path.match(/\.(png|jpg|jpeg|webp)$/i)) {
        // Preload texture/image
        await this.preloadImage(path);
        estimatedSize = 200 * 1024; // Estimate 200KB per image
      } else if (path.match(/\.(yaml|json)$/i)) {
        // Preload data file
        await this.preloadData(path);
        estimatedSize = 50 * 1024; // Estimate 50KB per data file
      }
      
      // Add to cache
      this.addToCache(path, estimatedSize, priority);
      
      debug(`Preloaded: ${path} (${priority})`, undefined, 'resourcePreloader');
    } catch (error) {
      warn(`Failed to preload asset: ${path}`, error, 'resourcePreloader');
    }
  }

  /**
   * Add asset to cache with size management
   */
  private addToCache(
    path: string,
    size: number,
    priority: 'critical' | 'high' | 'medium' | 'low'
  ): void {
    // Check if we need to free space
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.evictLRU(size);
    }

    const entry: CacheEntry = {
      path,
      size,
      lastAccess: Date.now(),
      priority
    };

    this.loadedAssets.set(path, entry);
    this.currentCacheSize += size;
  }

  /**
   * Evict least recently used assets to free space
   */
  private evictLRU(sizeNeeded: number): void {
    const entries = Array.from(this.loadedAssets.entries())
      .filter(([_, entry]) => entry.priority !== 'critical') // Never evict critical assets
      .sort((a, b) => {
        // Sort by priority first, then by last access time
        const priorityDiff = this.PRIORITY[a[1].priority] - this.PRIORITY[b[1].priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a[1].lastAccess - b[1].lastAccess;
      });

    let freedSpace = 0;
    for (const [path, entry] of entries) {
      if (freedSpace >= sizeNeeded) break;

      // Clear from cache
      if (path.endsWith('.glb')) {
        useGLTF.clear(path);
      }

      this.loadedAssets.delete(path);
      this.currentCacheSize -= entry.size;
      freedSpace += entry.size;

      debug(`Evicted: ${path} (${(entry.size / 1024).toFixed(0)}KB)`, undefined, 'resourcePreloader');
    }
  }

  /**
   * Preload font file
   */
  private preloadFont(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = path.endsWith('.woff2') ? 'font/woff2' : 'font/ttf';
      link.crossOrigin = 'anonymous';
      link.href = path;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  /**
   * Preload image/texture
   */
  private preloadImage(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = path;
    });
  }

  /**
   * Preload data file (YAML/JSON)
   */
  private async preloadData(path: string): Promise<void> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    await response.text(); // Just load it, browser will cache
  }

  /**
   * Queue asset for background loading with priority
   */
  queueAsset(
    path: string, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    if (this.loadedAssets.has(path)) {
      // Update last access time
      const entry = this.loadedAssets.get(path)!;
      entry.lastAccess = Date.now();
      return;
    }

    if (this.loadingQueue.some(item => item.path === path)) {
      return; // Already queued
    }

    this.loadingQueue.push({ 
      path, 
      priority: this.PRIORITY[priority] 
    });

    // Sort queue by priority (highest first)
    this.loadingQueue.sort((a, b) => b.priority - a.priority);

    // Start processing if not already
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Queue multiple assets at once
   */
  queueAssets(paths: string[], priority: 'high' | 'medium' | 'low' = 'medium'): void {
    paths.forEach(path => this.queueAsset(path, priority));
  }

  /**
   * Process loading queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.loadingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.loadingQueue.length > 0) {
      // Take up to maxConcurrent items
      const batch = this.loadingQueue.splice(0, this.maxConcurrent);
      
      // Load in parallel
      await Promise.allSettled(
        batch.map(item => this.preloadAsset(item.path, 'medium'))
      );

      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessing = false;
  }

  /**
   * Preload assets needed for specific game mode
   */
  async preloadForMode(mode: string, language?: string): Promise<void> {
    const assets: string[] = [];

    // Common assets
    assets.push('/data/normal_words.yaml');

    if (mode === 'programming' && language) {
      const langMap: Record<string, string> = {
        'Python': 'python',
        'JavaScript': 'javascript',
        'Java': 'java',
        'C#': 'csharp',
        'C++': 'cplusplus',
        'CSS': 'css',
        'HTML': 'html',
      };
      const langFile = langMap[language] || 'python';
      assets.push(`/data/${langFile}_words.yaml`);
    }

    // Queue mode-specific assets
    this.queueAssets(assets, 'high');
  }

  /**
   * Clear unused assets from memory (called when returning to menu)
   */
  clearNonCriticalAssets(): void {
    const nonCritical = Array.from(this.loadedAssets.entries())
      .filter(([_, entry]) => entry.priority !== 'critical');

    nonCritical.forEach(([path, entry]) => {
      if (path.endsWith('.glb')) {
        useGLTF.clear(path);
      }
      this.loadedAssets.delete(path);
      this.currentCacheSize -= entry.size;
    });

    info('resourcePreloader', `Cleared ${nonCritical.length} non-critical assets`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      totalAssets: this.loadedAssets.size,
      cacheSize: this.currentCacheSize,
      cacheSizeMB: (this.currentCacheSize / 1024 / 1024).toFixed(2),
      maxCacheSizeMB: (this.maxCacheSize / 1024 / 1024).toFixed(2),
      utilizationPercent: ((this.currentCacheSize / this.maxCacheSize) * 100).toFixed(1),
      queueLength: this.loadingQueue.length
    };
  }

  /**
   * Log cache statistics
   */
  logStats(): void {
    const stats = this.getCacheStats();
    debug(`Total Assets: ${stats.totalAssets}`, undefined, 'resourcePreloader');
    debug(`Cache Size: ${stats.cacheSizeMB}MB / ${stats.maxCacheSizeMB}MB (${stats.utilizationPercent}%)`, undefined, 'resourcePreloader');
    debug(`Queue Length: ${stats.queueLength}`, undefined, 'resourcePreloader');
  }
}

export const resourcePreloader = new ResourcePreloader();

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).__resourcePreloader = resourcePreloader;
}
