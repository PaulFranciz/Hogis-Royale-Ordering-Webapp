import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { auth } from '../Firebase/FirebaseConfig';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="user-menu">
      <button onClick={() => setIsOpen(!isOpen)} className="user-icon">
        <User size={24} />
      </button>
      {isOpen && (
        <div className="dropdown">
          {isLoggedIn ? (
            <Link to="/account" onClick={() => setIsOpen(false)}>My Account</Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setIsOpen(false)}>Signup</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;