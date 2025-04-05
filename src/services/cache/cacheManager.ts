import { CacheManagerInterface } from './types';
import { injectable } from 'inversify';

@injectable()
export class CacheManager implements CacheManagerInterface {
  private cacheStoreName: string;

  constructor(storeName = 'pos-app-cache') {
    this.cacheStoreName = storeName;
  }

  public async getItem<T>(key: string): Promise<T | null> {
    try {
      const cache = await caches.open(this.cacheStoreName);
      const response = await cache.match(key);

      if (response) {
        const data = await response.json();

        // Check if the item is expired
        if (data.expiry && data.expiry < Date.now()) {
          await this.removeItem(key);
          return null;
        }

        return data.value;
      }

      return null;
    } catch (error) {
      console.error(`Failed to get item from cache: ${key}`, error);
      return null;
    }
  }

  public async setItem<T>(key: string, value: T, expiryTimeMs?: number): Promise<void> {
    try {
      const cache = await caches.open(this.cacheStoreName);

      const cacheData = {
        value,
        expiry: expiryTimeMs ? Date.now() + expiryTimeMs : null,
        timestamp: Date.now(),
      };

      const response = new Response(JSON.stringify(cacheData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await cache.put(key, response);
    } catch (error) {
      console.error(`Failed to set item in cache: ${key}`, error);
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      const cache = await caches.open(this.cacheStoreName);
      await cache.delete(key);
    } catch (error) {
      console.error(`Failed to remove item from cache: ${key}`, error);
    }
  }

  public async clear(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.filter((name) => name === this.cacheStoreName).map((name) => caches.delete(name))
      );
    } catch (error) {
      console.error('Failed to clear cache', error);
    }
  }
}
