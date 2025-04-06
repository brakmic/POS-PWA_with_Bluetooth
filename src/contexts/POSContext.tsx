import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Cart, CartItem, Order, Product, Payment } from '@appTypes/pos.types';
import { useApiService } from '@hooks/useApiService';
import { useVatServiceDirect } from '@hooks/useService';
import { VatBreakdownItem } from '../services/vat';

// Include VAT information
interface EnhancedCart extends Cart {
  subtotal: number;
  vatTotal: number;
  vatBreakdown: VatBreakdownItem[];
}

interface POSContextValue {
  cart: EnhancedCart;
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

const initialCart: EnhancedCart = {
  items: [],
  totalAmount: 0,
  subtotal: 0,
  vatTotal: 0,
  vatBreakdown: [],
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
  const vatService = useVatServiceDirect();
  // Add a ref to track loading state without triggering re-renders
  const isLoadingRef = useRef(false);
  // Add lastFetch timestamp to prevent duplicate requests
  const lastFetchRef = useRef<number | null>(null);
  // Create a ref to track products length separately from the state
  const productsLengthRef = useRef<number>(0);

  const [cart, setCart] = useState<EnhancedCart>(initialCart);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add an effect to keep the ref in sync with actual products length
  useEffect(() => {
    productsLengthRef.current = products.length;
  }, [products]);

  /**
   * Calculate total with VAT for cart items
   */
  const calculateTotal = (
    items: CartItem[]
  ): {
    subtotal: number;
    vatTotal: number;
    total: number;
    vatBreakdown: VatBreakdownItem[];
  } => {
    const vatSummary = vatService.calculateCartVat(items);
    return {
      subtotal: vatSummary.subtotal,
      vatTotal: vatSummary.vatTotal,
      total: vatSummary.grandTotal,
      vatBreakdown: vatSummary.vatBreakdown,
    };
  };

  /**
   * Add a product to the cart with VAT calculation
   */
  const addToCart = (product: Product, quantity = 1) => {
    setCart((currentCart: EnhancedCart) => {
      const existingItem = currentCart.items.find((item) => item.product.id === product.id);

      let updatedItems: CartItem[];

      if (existingItem) {
        updatedItems = currentCart.items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updatedItems = [...currentCart.items, { product, quantity }];
      }

      // Calculate totals with VAT
      const { subtotal, vatTotal, total, vatBreakdown } = calculateTotal(updatedItems);

      return {
        items: updatedItems,
        totalAmount: total,
        subtotal,
        vatTotal,
        vatBreakdown,
      };
    });
  };

  /**
   * Remove a product from the cart and recalculate VAT
   */
  const removeFromCart = (productId: string) => {
    setCart((currentCart: EnhancedCart) => {
      const updatedItems = currentCart.items.filter((item) => item.product.id !== productId);

      // If cart is empty, return initial state
      if (updatedItems.length === 0) {
        return initialCart;
      }

      // Calculate totals with VAT
      const { subtotal, vatTotal, total, vatBreakdown } = calculateTotal(updatedItems);

      return {
        items: updatedItems,
        totalAmount: total,
        subtotal,
        vatTotal,
        vatBreakdown,
      };
    });
  };

  /**
   * Update quantity of a product in cart and recalculate VAT
   */
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((currentCart: EnhancedCart) => {
      const updatedItems = currentCart.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );

      // Calculate totals with VAT
      const { subtotal, vatTotal, total, vatBreakdown } = calculateTotal(updatedItems);

      return {
        items: updatedItems,
        totalAmount: total,
        subtotal,
        vatTotal,
        vatBreakdown,
      };
    });
  };

  /**
   * Clear the cart
   */
  const clearCart = () => {
    setCart(initialCart);
  };

  /**
   * Process checkout with VAT calculations
   */
  const checkout = async (paymentDetails: Payment): Promise<Order | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Create base order items
      const orderItems = cart.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Create order data with VAT information
      const orderData = {
        items: orderItems,
        status: 'pending' as const,
        timestamp: new Date().toISOString(),
        paymentMethod: paymentDetails.method,
        totalAmount: cart.totalAmount,
        subtotal: cart.subtotal,
        vatTotal: cart.vatTotal,
        vatBreakdown: cart.vatBreakdown,
      };

      console.log('Sending order data with VAT:', orderData);

      // Create order through API
      const order = await apiService.createOrder(cart.items, cart.totalAmount, paymentDetails);

      if (!order) {
        console.error('Order creation failed');
        setError('Failed to create order');
        return null;
      }

      // Enhance order with VAT information before saving
      const enhancedOrder = {
        ...order,
        subtotal: cart.subtotal,
        vatTotal: cart.vatTotal,
        vatBreakdown: cart.vatBreakdown,
      };

      // Add the enhanced order to our list
      setOrders((current) => [...current, enhancedOrder]);
      clearCart();

      // Update inventory for each item
      for (const item of cart.items) {
        await apiService.updateInventory(
          item.product.id,
          Math.max(0, item.product.stock - item.quantity)
        );
      }

      return enhancedOrder;
    } catch (err) {
      console.error('Checkout process error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load products with caching
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
        productsLengthRef.current > 0
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
          productsLengthRef.current = 0;
        } else {
          const productArray = Array.isArray(productsData) ? productsData : [];
          console.log(`Setting ${productArray.length} products in state`);
          setProducts(productArray);
          productsLengthRef.current = productArray.length;
          lastFetchRef.current = Date.now();
        }
      } catch (err) {
        console.error('Exception loading products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      } finally {
        console.log('Finished loading products');
        setIsLoading(false);
        productsLengthRef.current = 0;
        isLoadingRef.current = false;
      }
    },
    [apiService, setIsLoading, setProducts, setError]
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
