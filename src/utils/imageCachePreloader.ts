import { fetchApi } from './api';
import { Product } from '@appTypes/pos.types';

export async function preloadProductImages() {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') return;

  try {
    console.log('Pre-caching product images for development...');

    // Use fetchApi utility instead of direct fetch
    const response = await fetchApi<Product[]>('/api/products');

    if (response.error) {
      throw new Error(`Failed to fetch products: ${response.error}`);
    }

    const products = response.data;

    if (!products || !Array.isArray(products)) {
      throw new Error('Invalid product data format');
    }

    // Open a specific cache for product images
    const cache = await caches.open('product-images');

    // Process each product and cache its image
    for (const product of products) {
      if (product.imageUrl) {
        try {
          // Check if already cached
          const cachedResponse = await cache.match(product.imageUrl);
          if (!cachedResponse) {
            // Fetch and cache the image
            const imageResponse = await fetch(product.imageUrl);
            if (imageResponse.ok) {
              await cache.put(product.imageUrl, imageResponse);
              console.log(`Cached image: ${product.imageUrl}`);
            }
          }
        } catch (err) {
          console.warn(`Failed to cache image for ${product.name}:`, err);
        }
      }
    }

    console.log('Product image pre-caching complete');
  } catch (error) {
    console.error('Failed to pre-cache product images:', error);
  }
}
