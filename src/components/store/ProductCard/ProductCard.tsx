import React from 'react';
import { Product } from '@appTypes/pos.types';
import CachedImage from '@components/common/CachedImage';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { name, price, description, imageUrl, stock } = product;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="product-card">
      <div className="product-card-image">
        {imageUrl ? (
          <CachedImage src={imageUrl} alt={name} />
        ) : (
          <div className="placeholder-image">
            <span>{name.charAt(0)}</span>
          </div>
        )}

        {isOutOfStock && <div className="out-of-stock-badge">Out of Stock</div>}
        {isLowStock && <div className="low-stock-badge">Low Stock: {stock} left</div>}
      </div>

      <div className="product-card-content">
        <h3 className="product-card-title">{name}</h3>
        <div className="product-card-price">${price.toFixed(2)}</div>

        {description && <p className="product-card-description">{description}</p>}

        <button className="add-to-cart-button" onClick={onAddToCart} disabled={isOutOfStock}>
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
