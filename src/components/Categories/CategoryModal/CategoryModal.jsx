import React from 'react';
import './CategoryModal.css';
import { IoClose, IoCartOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useShoppingCart } from '../../ShoppingCart/ShoppingCartContext';

const CategoryModal = ({ category, items, onClose, onLoadMore }) => {
  const { addToCart } = useShoppingCart();

  console.log("Modal category:", category);
  console.log("Modal items:", items);
  console.log("Items length:", items ? items.length : 0);

  const formatPrice = (price) => {
    return price.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const handleAddToCart = (item) => {
    console.log('Adding item to cart:', item);
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="category-modal-overlay" onClick={onClose}>
      <div className="category-modal-content" onClick={e => e.stopPropagation()}>
        <IoClose className="category-modal-close-icon" onClick={onClose} />
        <h2 className='category-modal-title'>{category}</h2>
        {items && items.length > 0 ? (
          <ul className="category-modal-list">
            {items.map((item, index) => (
              <li key={`${item.id || item.name}-${index}`} className="category-modal-item">
                <span className="category-modal-item-name">{item.name}</span>
                <span className="category-modal-item-price">{formatPrice(parseFloat(item.price))}</span>
                <IoCartOutline
                  className="category-modal-add-to-cart-icon"
                  onClick={() => handleAddToCart(item)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="category-modal-empty-message">No items available for this category.</p>
        )}
        {onLoadMore && <button className="category-modal-load-more" onClick={onLoadMore}>Load More</button>}
      </div>
    </div>
  );
};

export default CategoryModal;
