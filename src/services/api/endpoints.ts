export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  PRODUCT: (id: string) => `/api/products/${id}`,
  ORDERS: '/api/orders',
  ORDER: (id: string) => `/api/orders/${id}`,
  INVENTORY: '/api/products/inventory',
};

export const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://mock-api.local:5000',
  timeout: 10000, // 10 seconds
};
