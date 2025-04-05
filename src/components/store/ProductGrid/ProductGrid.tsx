import React from 'react';
import { Product } from '@appTypes/pos.types';
import ProductCard from '../ProductCard';
import './ProductGrid.css';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => onAddToCart(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
