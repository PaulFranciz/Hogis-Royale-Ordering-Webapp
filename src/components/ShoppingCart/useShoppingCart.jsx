import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoCart, IoRemove, IoAdd, IoTrash } from 'react-icons/io5';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useShoppingCart } from './ShoppingCartContext';
import emptybag from '/empty-bag.svg'
import './ShoppingCart.css';

export const ShoppingCartIcon = () => {
  const { cartItems } = useShoppingCart();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div>
      <Link to="/cart" className="cart-toggle">
        <IoCart />
        <span className="cart-count">{itemCount}</span>
      </Link>
    </div>
  );
};

export const ShoppingCartPage = () => {
  const { cartItems, updateQuantity, removeItem } = useShoppingCart();
  const navigate = useNavigate();
  const [isHogisGuest, setIsHogisGuest] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('');

  useEffect(() => {
    console.log('ShoppingCartPage - Cart items:', cartItems);
  }, [cartItems]);

  const hogisLocations = {
    'Room Service': 0,
    'Within Hogis Royale': 0
  };

  const deliveryPrices = {
    'Calabar Municipality': 1500,
    'Calabar South': 1500,
    '8 miles': 2000,
    'Akpabuyo': 3000
  };

  const getDeliveryPrice = () => {
    if (isHogisGuest) {
      return hogisLocations[deliveryOption] || 0;
    } else {
      return deliveryPrices[deliveryOption] || 0;
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryPrice = getDeliveryPrice();

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const handleUpdateQuantity = (uniqueId, newQuantity) => {
    updateQuantity(uniqueId, newQuantity);
    toast.success('Cart updated successfully!', {
      onClick: () => navigate('/cart')
    });
  };

  const handleRemoveItem = (uniqueId) => {
    removeItem(uniqueId);
    toast.info('Item removed from cart.', {
      onClick: () => navigate('/cart')
    });
  };

  return (
    <div className="shopping-cart-page">
      <h1 className="cart-title">Cart</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <img 
            src={emptybag} 
            alt="Empty shopping cart illustration" 
            className="empty-cart-illustration"
          />
          <p className="empty-cart">Your cart is empty</p>
          <Link to="/menu" className="back-to-shop">Browse Our Menu</Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items-container">
            <ul className="cart-items">
              {cartItems.map((item) => (
                <li key={item.uniqueId} className="cart-item">
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <div className="item-actions">
                      <div className="quantity-control">
                        <button onClick={() => handleUpdateQuantity(item.uniqueId, item.quantity - 1)} className="quantity-btn">
                          <IoRemove />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.uniqueId, item.quantity + 1)} className="quantity-btn">
                          <IoAdd />
                        </button>
                      </div>
                      <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => handleRemoveItem(item.uniqueId)} className="remove-btn">
                        <IoTrash />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="cart-summary">
            <h4>Summary</h4>
            <div className="summary-details">
              <div className="summary-row">
                <span className='items-amount'>{cartItems.length} ITEMS</span>
                <span className='item-amount-price'>{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span className='delivery'>DELIVERY</span>
                {isHogisGuest === null ? (
                  <div>
                    <p>Are you a guest @Hogis Royale?</p>
                    <div className='guest-flex'>
                    <button onClick={() => setIsHogisGuest(true)} className='isGuest-btn'>Yes</button>
                    <button onClick={() => setIsHogisGuest(false)} className='isGuest-btn'>No</button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={deliveryOption} 
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="delivery-select"
                  >
                    <option value="">Select a location</option>
                    {isHogisGuest
                      ? Object.entries(hogisLocations).map(([location, price]) => (
                          <option key={location} value={location}>
                            {location} - {formatPrice(price)}
                          </option>
                        ))
                      : Object.entries(deliveryPrices).map(([location, price]) => (
                          <option key={location} value={location}>
                            {location} - {formatPrice(price)}
                          </option>
                        ))
                    }
                  </select>
                )}
              </div>
            </div>
            <div className="total-price">
              <span>TOTAL PRICE</span>
              <span>{formatPrice(totalPrice + deliveryPrice)}</span>
            </div>
            <Link to="/checkout" className="checkout-btn">CHECKOUT</Link>
          </div>
        </div>
      )}
      {cartItems.length > 0 && <Link to="/menu" className="back-to-shop">← continue shopping</Link>}
    </div>
  );
};

export default ShoppingCartPage;