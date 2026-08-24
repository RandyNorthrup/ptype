/**
 * Resource Preloader - Manages asset loading priority and memory with intelligent caching
 */
import { useGLTF } from "@react-three/drei";
import { performanceMonitor } from "./performanceMonitor";
import { info, warn, debug } from "./logger";

interface CacheEntry {
  path: string;
  size: number;
  lastAccess: number;
  priority: "critical" | "high" | "medium" | "low";
}

interface CacheStats {
  totalAssets: number;
  cacheSize: number;
  cacheSizeMB: string;
  maxCacheSizeMB: string;
  utilizationPercent: string;
  queueLength: number;
}

const CACHE_CONFIG = {
  maxConcurrent: 3,
  bytesPerKibibyte: 1024,
  maximumMebibytes: 100,
  modelEstimateKibibytes: 500,
  fontEstimateKibibytes: 100,
  imageEstimateKibibytes: 200,
  dataEstimateKibibytes: 50,
  queueDelayMilliseconds: 10,
  percentageScale: 100,
  sizePrecision: 2,
  utilizationPrecision: 1,
} as const;

class ResourcePreloader {
  private loadedAssets = new Map<string, CacheEntry>();
  private loadingQueue: { path: string; priority: number }[] = [];
  private maxConcurrent = CACHE_CONFIG.maxConcurrent;
  private maxCacheSize =
    CACHE_CONFIG.maximumMebibytes *
    CACHE_CONFIG.bytesPerKibibyte *
    CACHE_CONFIG.bytesPerKibibyte;
  private currentCacheSize = 0;
  private isProcessing = false;

  // Asset priorities
  private readonly PRIORITY = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  /**
   * Preload critical assets first with performance tracking
   */
  async preloadCriticalAssets(): Promise<void> {
    await performanceMonitor.measureAsync("Critical Assets Load", async () => {
      const critical = [
        "/assets/models/ships/player-ship.glb",
        "/assets/models/ships/enemy-basic.glb",
        "/assets/fonts/Orbitron-Regular.ttf",
      ];

      // Preload in parallel with priority
      await Promise.all(
        critical.map((asset) => this.preloadAsset(asset, "critical")),
      );

      info("Critical assets preloaded", undefined, "resourcePreloader");
    });
  }

  /**
   * Preload an asset with priority
   */
  private async preloadAsset(
    path: string,
    priority: "critical" | "high" | "medium" | "low" = "medium",
  ): Promise<void> {
    // Check if already loaded
    const existing = this.loadedAssets.get(path);
    if (existing) {
      existing.lastAccess = Date.now();
      return;
    }

    try {
      let estimatedSize = 0;

      if (path.endsWith(".glb")) {
        // Preload 3D model
        useGLTF.preload(path);
        estimatedSize =
          CACHE_CONFIG.modelEstimateKibibytes * CACHE_CONFIG.bytesPerKibibyte;
      } else if (path.endsWith(".ttf") || path.endsWith(".woff2")) {
        // Preload font
        await this.preloadFont(path);
        estimatedSize =
          CACHE_CONFIG.fontEstimateKibibytes * CACHE_CONFIG.bytesPerKibibyte;
      } else if (/\.(png|jpg|jpeg|webp)$/i.test(path)) {
        // Preload texture/image
        await this.preloadImage(path);
        estimatedSize =
          CACHE_CONFIG.imageEstimateKibibytes * CACHE_CONFIG.bytesPerKibibyte;
      } else if (/\.(yaml|json)$/i.test(path)) {
        // Preload data file
        await this.preloadData(path);
        estimatedSize =
          CACHE_CONFIG.dataEstimateKibibytes * CACHE_CONFIG.bytesPerKibibyte;
      }

      // Add to cache
      this.addToCache(path, estimatedSize, priority);

      debug(`Preloaded: ${path} (${priority})`, undefined, "resourcePreloader");
    } catch (error) {
      warn(`Failed to preload asset: ${path}`, error, "resourcePreloader");
    }
  }

  /**
   * Add asset to cache with size management
   */
  private addToCache(
    path: string,
    size: number,
    priority: "critical" | "high" | "medium" | "low",
  ): void {
    // Check if we need to free space
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.evictLRU(size);
    }

    const entry: CacheEntry = {
      path,
      size,
      lastAccess: Date.now(),
      priority,
    };

    this.loadedAssets.set(path, entry);
    this.currentCacheSize += size;
  }

  /**
   * Evict least recently used assets to free space
   */
  private evictLRU(sizeNeeded: number): void {
    const entries = [...this.loadedAssets]
      .filter(([_, entry]) => entry.priority !== "critical") // Never evict critical assets
      .toSorted((a, b) => {
        // Sort by priority first, then by last access time
        const priorityDiff =
          this.PRIORITY[a[1].priority] - this.PRIORITY[b[1].priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a[1].lastAccess - b[1].lastAccess;
      });

    let freedSpace = 0;
    for (const [path, entry] of entries) {
      if (freedSpace >= sizeNeeded) break;

      // Clear from cache
      if (path.endsWith(".glb")) {
        useGLTF.clear(path);
      }

      this.loadedAssets.delete(path);
      this.currentCacheSize -= entry.size;
      freedSpace += entry.size;

      debug(
        `Evicted: ${path} (${(entry.size / CACHE_CONFIG.bytesPerKibibyte).toFixed(0)}KB)`,
        undefined,
        "resourcePreloader",
      );
    }
  }

  /**
   * Preload font file
   */
  private preloadFont(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = path.endsWith(".woff2") ? "font/woff2" : "font/ttf";
      link.crossOrigin = "anonymous";
      link.href = path;
      link.addEventListener("load", () => {
        resolve();
      });
      link.addEventListener("error", () => {
        reject(new Error(`Failed to preload font: ${path}`));
      });
      document.head.append(link);
    });
  }

  /**
   * Preload image/texture
   */
  private preloadImage(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => {
        resolve();
      });
      image.addEventListener("error", () => {
        reject(new Error(`Failed to preload image: ${path}`));
      });
      image.src = path;
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
    priority: "high" | "medium" | "low" = "medium",
  ): void {
    if (this.loadedAssets.has(path)) {
      // Update last access time
      const entry = this.loadedAssets.get(path);
      if (entry) entry.lastAccess = Date.now();
      return;
    }

    if (this.loadingQueue.some((item) => item.path === path)) {
      return; // Already queued
    }

    this.loadingQueue.push({
      path,
      priority: this.PRIORITY[priority],
    });

    // Sort queue by priority (highest first)
    this.loadingQueue = this.loadingQueue.toSorted(
      (a, b) => b.priority - a.priority,
    );

    // Start processing if not already
    if (!this.isProcessing) {
      void this.processQueue();
    }
  }

  /**
   * Queue multiple assets at once
   */
  queueAssets(
    paths: string[],
    priority: "high" | "medium" | "low" = "medium",
  ): void {
    for (const path of paths) this.queueAsset(path, priority);
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
        batch.map((item) => this.preloadAsset(item.path, "medium")),
      );

      // Small delay to prevent blocking
      await new Promise((resolve) =>
        setTimeout(resolve, CACHE_CONFIG.queueDelayMilliseconds),
      );
    }

    this.isProcessing = false;
  }

  /**
   * Clear unused assets from memory (called when returning to menu)
   */
  clearNonCriticalAssets(): void {
    const nonCritical = [...this.loadedAssets].filter(
      ([_, entry]) => entry.priority !== "critical",
    );

    for (const [path, entry] of nonCritical) {
      if (path.endsWith(".glb")) {
        useGLTF.clear(path);
      }
      this.loadedAssets.delete(path);
      this.currentCacheSize -= entry.size;
    }

    info(
      `Cleared ${nonCritical.length.toString()} non-critical assets`,
      undefined,
      "resourcePreloader",
    );
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      totalAssets: this.loadedAssets.size,
      cacheSize: this.currentCacheSize,
      cacheSizeMB: (
        this.currentCacheSize /
        CACHE_CONFIG.bytesPerKibibyte /
        CACHE_CONFIG.bytesPerKibibyte
      ).toFixed(CACHE_CONFIG.sizePrecision),
      maxCacheSizeMB: (
        this.maxCacheSize /
        CACHE_CONFIG.bytesPerKibibyte /
        CACHE_CONFIG.bytesPerKibibyte
      ).toFixed(CACHE_CONFIG.sizePrecision),
      utilizationPercent: (
        (this.currentCacheSize / this.maxCacheSize) *
        CACHE_CONFIG.percentageScale
      ).toFixed(CACHE_CONFIG.utilizationPrecision),
      queueLength: this.loadingQueue.length,
    };
  }

  /**
   * Log cache statistics
   */
  logStats(): void {
    const stats = this.getCacheStats();
    debug(
      `Total Assets: ${stats.totalAssets.toString()}`,
      undefined,
      "resourcePreloader",
    );
    debug(
      `Cache Size: ${stats.cacheSizeMB}MB / ${stats.maxCacheSizeMB}MB (${stats.utilizationPercent}%)`,
      undefined,
      "resourcePreloader",
    );
    debug(
      `Queue Length: ${stats.queueLength.toString()}`,
      undefined,
      "resourcePreloader",
    );
  }
}

export const resourcePreloader = new ResourcePreloader();
