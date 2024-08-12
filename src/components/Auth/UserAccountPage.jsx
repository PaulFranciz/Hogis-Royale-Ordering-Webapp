import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShoppingBag, LogOut, ChevronRight } from 'lucide-react';
import emptyBasket from '/empty-bag.svg';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';

const UserAccountPage = () => {
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cartItems } = useShoppingCart();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));

          if (adminDoc.exists() && adminDoc.data().isAdmin) {
            setIsAdmin(true);
            setUser({ id: currentUser.uid, email: currentUser.email, ...adminDoc.data() });
          } else if (userDoc.exists()) {
            setUser({ id: currentUser.uid, ...userDoc.data() });
            setOrderHistory(userDoc.data().orderHistory || []);
          } else {
            console.error('User document does not exist');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/menu');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const calculateMembershipDuration = (createdAt) => {
    if (!createdAt) return 'N/A';
    const now = new Date();
    const creationDate = new Date(createdAt.toDate());
    const diffTime = Math.abs(now - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    const diffRemainingDays = diffDays % 30;

    let duration = '';
    if (diffYears > 0) duration += `${diffYears} year${diffYears > 1 ? 's' : ''} `;
    if (diffMonths > 0) duration += `${diffMonths} month${diffMonths > 1 ? 's' : ''} `;
    if (diffRemainingDays > 0) duration += `${diffRemainingDays} day${diffRemainingDays > 1 ? 's' : ''}`;

    return duration.trim();
  };

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  if (loading) {
    return <div className="uap-loading">Loading...</div>;
  }

  if (!user) {
    return <div className="uap-error">Error loading user data</div>;
  }

  return (
    <div className="uap-container">
      <nav className="uap-breadcrumb">
        <Link to="/menu" className="uap-breadcrumb-link">Menu</Link>
        <ChevronRight className="uap-breadcrumb-icon" />
        <span className="uap-breadcrumb-current">My Account</span>
      </nav>

      <h1 className="uap-page-title">My Account</h1>
      
      <div className="uap-account-grid">
        <div className="uap-card uap-user-info">
          <h2 className="uap-card-title">
            <User className="uap-icon" /> User Information
          </h2>
          <div className="uap-info-content">
            <p><strong>Name:</strong> {isAdmin ? 'Admin' : `${user.firstName} ${user.lastName}`}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {isAdmin ? 'Administrator' : 'User'}</p>
            {!isAdmin && (
              <>
                <p><strong>Member since:</strong> {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Membership duration:</strong> {calculateMembershipDuration(user.createdAt)}</p>
              </>
            )}
          </div>
        </div>

        {!isAdmin && (
          <>
            <div className="uap-card uap-current-cart">
              <h2 className="uap-card-title">
                <ShoppingBag className="uap-icon" /> Current Cart
              </h2>
              {cartItems.length === 0 ? (
                <div className='uap-empty-state'>
                  <img src={emptyBasket} alt="Empty cart" className="uap-empty-illustration" />
                  <p className="uap-no-items">Your cart is empty.</p>
                </div>
              ) : (
                <ul className="uap-cart-list">
                  {cartItems.map((item) => (
                    <li key={item.id} className="uap-cart-item">
                      <p className="uap-item-name"><strong>{item.name}</strong></p>
                      <p className="uap-item-quantity">Quantity: {item.quantity}</p>
                      <p className="uap-item-price">Price: {formatPrice(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="uap-card uap-order-history">
              <h2 className="uap-card-title">
                <ShoppingBag className="uap-icon" /> Order History
              </h2>
              {orderHistory.length === 0 ? (
                <div className='uap-empty-state'>
                  <img src={emptyBasket} alt="No orders" className="uap-empty-illustration" />
                  <p className="uap-no-orders">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <ul className="uap-order-list">
                  {orderHistory.map((order, index) => (
                    <li key={index} className="uap-order-item">
                      <p><strong>Order ID:</strong> {order.id}</p>
                      <p><strong>Date:</strong> {new Date(order.date.toDate()).toLocaleDateString()}</p>
                      <p><strong>Total:</strong> {formatPrice(order.total)}</p>
                      <ul className="uap-order-items">
                        {order.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="uap-order-subitem">
                            {item.name} - Quantity: {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      <div className="uap-logout-container">
        <button onClick={handleLogout} className="uap-logout-button">
          <LogOut className="uap-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default UserAccountPage;