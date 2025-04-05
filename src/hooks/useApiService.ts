import { useState, useCallback, useContext } from 'react';
import { InversifyContext } from '../contexts/InversifyContext';
import { SERVICE_IDENTIFIERS } from '../services/inversify/identifiers';
import type { ApiServiceInterface } from '../services/api/types';
import { Product, Order, OrderItem, Payment } from '@appTypes/pos.types';

export const useApiService = () => {
  // Get the service from InversifyJS container
  const container = useContext(InversifyContext);
  const apiService = container.get<ApiServiceInterface>(SERVICE_IDENTIFIERS.ApiService);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (): Promise<Product[] | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getProducts();

      if (response.error) {
        setError(response.error);
        return null;
      }

      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const fetchProduct = useCallback(
    async (id: string): Promise<Product | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.getProduct(id);

        if (response.error) {
          setError(response.error);
          return null;
        }

        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiService]
  );

  const createOrder = useCallback(
    async (
      items: { product: Product; quantity: number }[],
      totalAmount: number,
      payment: Payment
    ): Promise<Order | null> => {
      try {
        setIsLoading(true);
        setError(null);

        // Transform cart items into the expected OrderItem format
        const orderItems: OrderItem[] = items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        }));

        const orderData: Omit<Order, 'id'> = {
          items: orderItems, // Use the transformed items
          totalAmount,
          paymentMethod: payment.method, // Payment is an object with method property
          timestamp: new Date().toISOString(), // Make sure timestamp is a string
          status: 'pending' as const, // Use const assertion for literal type
        };

        console.log('Sending order data:', orderData);

        const response = await apiService.createOrder(orderData);

        if (response.error) {
          setError(response.error);
          return null;
        }

        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create order');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiService]
  );

  const fetchOrder = useCallback(
    async (id: string): Promise<Order | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.getOrder(id);

        if (response.error) {
          setError(response.error);
          return null;
        }

        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiService]
  );

  const updateInventory = useCallback(
    async (productId: string, quantity: number): Promise<Product | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.updateInventory(productId, quantity);

        if (response.error) {
          setError(response.error);
          return null;
        }

        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update inventory');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiService]
  );

  return {
    isLoading,
    error,
    fetchProducts,
    fetchProduct,
    createOrder,
    fetchOrder,
    updateInventory,
  };
};
