export interface CacheManagerInterface {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T, expiryTimeMs?: number): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
