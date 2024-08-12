import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const ShoppingCartContext = createContext();

export const ShoppingCartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadCartFromFirebase(currentUser.uid);
      } else {
        setUser(null);
        setCartItems([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadCartFromFirebase = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCartItems(userData.cart || []);
      }
    } catch (error) {
      console.error('Error loading cart from Firebase:', error);
    }
  };

  const saveCartToFirebase = async (updatedCart) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { cart: updatedCart });
      } catch (error) {
        console.error('Error saving cart to Firebase:', error);
      }
    }
  };

  const addToCart = async (item) => {
    const cartItemId = `${item.id}-${Date.now()}`;
    const newItem = { ...item, cartItemId, quantity: 1 };
    const updatedCart = [...cartItems, newItem];
    setCartItems(updatedCart);
    await saveCartToFirebase(updatedCart);
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity > 0) {
      const updatedCart = cartItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCart);
      await saveCartToFirebase(updatedCart);
    } else {
      await removeItem(cartItemId);
    }
  };

  const removeItem = async (cartItemId) => {
    const updatedCart = cartItems.filter((item) => item.cartItemId !== cartItemId);
    setCartItems(updatedCart);
    await saveCartToFirebase(updatedCart);
  };

  const clearCart = async () => {
    setCartItems([]);
    await saveCartToFirebase([]);
  };

  const addToOrderHistory = async (order) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          orderHistory: arrayUnion(order),
        });
      } catch (error) {
        console.error('Error adding to order history:', error);
      }
    }
  };

  const incrementQuantity = async (cartItemId) => {
    const updatedCart = cartItems.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
    await saveCartToFirebase(updatedCart);
  };

  const decrementQuantity = async (cartItemId) => {
    const item = cartItems.find((item) => item.cartItemId === cartItemId);
    if (item.quantity > 1) {
      const updatedCart = cartItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCartItems(updatedCart);
      await saveCartToFirebase(updatedCart);
    } else {
      await removeItem(cartItemId);
    }
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        addToOrderHistory,
        incrementQuantity,
        decrementQuantity,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = () => useContext(ShoppingCartContext);