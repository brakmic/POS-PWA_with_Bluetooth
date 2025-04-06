import React, { useEffect, useState } from 'react';
import { usePOS } from '@contexts/POSContext';
import ProductGrid from '@components/store/ProductGrid';
import ProductFilters from '@components/store/ProductFilters';
import ProductSearch from '@components/store/ProductSearch';
import './Store.css';

const Store: React.FC = () => {
  const { products, loadProducts, addToCart, isLoading, error } = usePOS();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Load products on mount
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter products when products, search term or category changes
  useEffect(() => {
    if (!Array.isArray(products)) return;

    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (activeCategory && activeCategory !== 'all') {
      result = result.filter((product) => product.category === activeCategory);
    }

    setFilteredProducts(result);
  }, [products, searchTerm, activeCategory]);

  // Extract unique categories from products
  const categories = Array.isArray(products)
    ? ['all', ...new Set(products.map((product) => product.category || 'uncategorized'))]
    : ['all'];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCart(product, 1);
    }
  };

  return (
    <div className="store-page">
      <div className="store-header">
        <h1>Product Catalog</h1>

        {/* Network status indicator
        <div className={`connection-status ${networkState.connectionType.toLowerCase()}`}>
          {networkState.isOnline ? `Connected via ${networkState.connectionType}` : 'Offline Mode'}
        </div> */}
      </div>

      <div className="store-content">
        <aside className="store-sidebar">
          <ProductFilters
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        <main className="store-main">
          <ProductSearch onSearch={handleSearch} />

          {/* Loading and error states */}
          {isLoading && <div className="loading">Loading products...</div>}
          {error && <div className="error">{error}</div>}

          {/* Products grid with defensive rendering */}
          {!isLoading &&
            (filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
            ) : (
              <div className="no-products">No products found matching your criteria</div>
            ))}
        </main>
      </div>
    </div>
  );
};

export default Store;
