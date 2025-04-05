import React from 'react';
import { Product } from '@appTypes/pos.types';
import './ItemList.css';

interface ItemListProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
}

const ItemList: React.FC<ItemListProps> = ({ products, isLoading, onAddToCart }) => {
  if (isLoading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="item-list">
      {products.map((product) => (
        <div key={product.id} className="product-item">
          <div className="product-image">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <div className="no-image">No Image</div>
            )}
          </div>
          <div className="product-details">
            <h3>{product.name}</h3>
            <p className="price">${product.price.toFixed(2)}</p>
            <p className="stock">Stock: {product.stock}</p>
          </div>
          <div className="product-actions">
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
              className="add-to-cart-btn"
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
