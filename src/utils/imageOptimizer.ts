/**
 * Image and Texture Optimizer
 * Provides lazy loading and optimization for images and textures
 */

import { warn } from './logger';

class ImageOptimizer {
  private imageCache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  /**
   * Preload an image with optional resize
   */
  async preloadImage(
    url: string,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<HTMLImageElement> {
    // Check cache
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) {
      return existingPromise;
    }

    // Start loading
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Optionally resize for optimization
        if (maxWidth || maxHeight) {
          const resized = this.resizeImage(img, maxWidth, maxHeight);
          this.imageCache.set(url, resized);
          resolve(resized);
        } else {
          this.imageCache.set(url, img);
          resolve(img);
        }
        this.loadingPromises.delete(url);
      };

      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });

    this.loadingPromises.set(url, loadPromise);
    return loadPromise;
  }

  /**
   * Resize image to fit within max dimensions while maintaining aspect ratio
   */
  private resizeImage(
    img: HTMLImageElement,
    maxWidth?: number,
    maxHeight?: number
  ): HTMLImageElement {
    if (!maxWidth && !maxHeight) return img;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    let width = img.width;
    let height = img.height;

    // Calculate new dimensions
    if (maxWidth && width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (maxHeight && height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    // Convert canvas to image
    const resized = new Image();
    resized.src = canvas.toDataURL('image/png');
    return resized;
  }

  /**
   * Preload multiple images in parallel
   */
  async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => this.preloadImage(url)));
  }

  /**
   * Create a low-quality placeholder image
   */
  async createPlaceholder(
    url: string,
    blurAmount: number = 10
  ): Promise<string> {
    try {
      const img = await this.preloadImage(url, 50, 50); // Very small for placeholder
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      return canvas.toDataURL('image/jpeg', 0.5);
    } catch (error) {
      warn('Failed to create placeholder', error, 'imageOptimizer');
      return '';
    }
  }

  /**
   * Lazy load image with Intersection Observer
   */
  lazyLoadImage(
    imgElement: HTMLImageElement,
    src: string,
    placeholder?: string
  ): void {
    if (placeholder) {
      imgElement.src = placeholder;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.preloadImage(src).then(loadedImg => {
            imgElement.src = loadedImg.src;
            observer.unobserve(imgElement);
          });
        }
      });
    });

    observer.observe(imgElement);
  }

  /**
   * Get cached image
   */
  getCachedImage(url: string): HTMLImageElement | undefined {
    return this.imageCache.get(url);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.imageCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      cachedImages: this.imageCache.size,
      loadingImages: this.loadingPromises.size,
    };
  }
}

// Singleton instance
export const imageOptimizer = new ImageOptimizer();

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).__imageOptimizer = imageOptimizer;
}
