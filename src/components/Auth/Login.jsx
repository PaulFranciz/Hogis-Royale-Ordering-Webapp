import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { FcGoogle } from "react-icons/fc";
import './Auth-styles.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await checkIfAdmin(user.uid);
        if (isAdmin) {
          navigate('/menu');
        } else {
          navigate('/menu');
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkIfAdmin = async (uid) => {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists() && adminDoc.data().isAdmin;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = await checkIfAdmin(userCredential.user.uid);
      if (isAdmin) {
        navigate('/menu');
      } else {
        navigate('/menu');
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError("You don't have an account yet! Please sign up.");
      } else {
        setError(error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const isAdmin = await checkIfAdmin(result.user.uid);
      if (isAdmin) {
        navigate('/menu');
      } else {
        navigate('/menu');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2 className="auth-title">Login</h2>
        {error && <p className="auth-error">{error}</p>}
        <input
          type="email"
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" className="auth-button">Login</button>
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <button type="button" className="auth-button google-button" onClick={handleGoogleLogin}>
          <FcGoogle className="google-icon" /> Sign in with Google
        </button>
        
        <div className="auth-links">
          <Link to="/signup" className="auth-link">Don't have an account? <span className='link'>Sign up</span></Link>
          <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;