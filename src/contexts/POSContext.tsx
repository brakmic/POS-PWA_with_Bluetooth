import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Cart, CartItem, Order, Product, Payment } from '@appTypes/pos.types';
import { useApiService } from '@hooks/useApiService';

interface POSContextValue {
  cart: Cart;
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (paymentDetails: Payment) => Promise<Order | null>;
  loadProducts: () => Promise<void>;
  getOrder: (orderId: string) => Promise<Order | null>;
}

const initialCart: Cart = {
  items: [],
  totalAmount: 0,
};

/* eslint-disable @typescript-eslint/no-empty-function */
const POSContext = createContext<POSContextValue>({
  cart: initialCart,
  products: [],
  orders: [],
  isLoading: false,
  error: null,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  checkout: async () => null,
  loadProducts: async () => {},
  getOrder: async () => null,
});
/* eslint-enable @typescript-eslint/no-empty-function */

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiService = useApiService();
  // Add a ref to track loading state without triggering re-renders
  const isLoadingRef = useRef(false);
  // Add lastFetch timestamp to prevent duplicate requests
  const lastFetchRef = useRef<number | null>(null);

  const [cart, setCart] = useState<Cart>(initialCart);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((currentCart: Cart) => {
      const existingItem = currentCart.items.find((item) => item.product.id === product.id);

      let updatedItems: CartItem[];

      if (existingItem) {
        updatedItems = currentCart.items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updatedItems = [...currentCart.items, { product, quantity }];
      }

      return {
        items: updatedItems,
        totalAmount: calculateTotal(updatedItems),
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart: Cart) => {
      const updatedItems = currentCart.items.filter((item) => item.product.id !== productId);

      return {
        items: updatedItems,
        totalAmount: calculateTotal(updatedItems),
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((currentCart: Cart) => {
      const updatedItems = currentCart.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );

      return {
        items: updatedItems,
        totalAmount: calculateTotal(updatedItems),
      };
    });
  };

  const clearCart = () => {
    setCart(initialCart);
  };

  const checkout = async (paymentDetails: Payment): Promise<Order | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Transform cart items to match OrderItem structure
      const orderItems = cart.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Create order data with correct structure
      const orderData = {
        totalAmount: cart.totalAmount,
        status: 'pending' as const,
        timestamp: new Date().toISOString(),
        paymentMethod: paymentDetails.method,
        items: orderItems,
      };

      console.log('Sending order data:', orderData);

      // Use createOrder method from the hook (which takes the correct parameters)
      const order = await apiService.createOrder(cart.items, cart.totalAmount, paymentDetails);

      if (!order) {
        console.error('Order creation failed');
        setError('Failed to create order');
        return null;
      }

      // Add the order to our list
      setOrders((current) => [...current, order]);
      clearCart();

      // Update inventory for each item
      for (const item of cart.items) {
        await apiService.updateInventory(
          item.product.id,
          Math.max(0, item.product.stock - item.quantity)
        );
      }

      return order;
    } catch (err) {
      console.error('Checkout process error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Deduplicated loadProducts with caching
  const loadProducts = useCallback(
    async (forceRefresh = false): Promise<void> => {
      console.log('loadProducts called, force refresh:', forceRefresh);

      // Prevent duplicate requests
      if (isLoadingRef.current) {
        console.log('Already loading, skipping request');
        return;
      }

      // Cache control: don't fetch again within 30 seconds unless forced
      const now = Date.now();
      if (
        !forceRefresh &&
        lastFetchRef.current &&
        now - lastFetchRef.current < 30000 &&
        products.length > 0
      ) {
        console.log(
          'Using cached products, last fetch:',
          new Date(lastFetchRef.current).toISOString()
        );
        return;
      }

      try {
        console.log('Starting API request for products');
        isLoadingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Use fetchProducts instead of getProducts
        const productsData = await apiService.fetchProducts();
        console.log('Products API response:', productsData);

        if (!productsData) {
          console.error('API error: No products returned');
          setError('Failed to load products');
          setProducts([]);
        } else {
          const productArray = Array.isArray(productsData) ? productsData : [];
          console.log(`Setting ${productArray.length} products in state`);
          setProducts(productArray);
          lastFetchRef.current = Date.now();
        }
      } catch (err) {
        console.error('Exception loading products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      } finally {
        console.log('Finished loading products');
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    [apiService, products.length]
  );

  const getOrder = async (orderId: string): Promise<Order | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // First check local orders
      const localOrder = orders.find((order) => order.id === orderId);
      if (localOrder) {
        return localOrder;
      }

      // If not found locally, fetch from API using fetchOrder instead of getOrder
      const order = await apiService.fetchOrder(orderId);

      if (!order) {
        setError('Failed to get order');
        return null;
      }

      // Add to local orders
      setOrders((current) => [...current, order]);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get order');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <POSContext.Provider
      value={{
        cart,
        products,
        orders,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        loadProducts,
        getOrder,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => useContext(POSContext);
