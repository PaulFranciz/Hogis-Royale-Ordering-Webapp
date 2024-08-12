import React, { useState } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth-styles.css';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email: user.email,
        createdAt: new Date(),
        orderHistory: []
      });

      toast.success('Signup successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName: user.displayName.split(' ')[0],
        lastName: user.displayName.split(' ').slice(1).join(' '),
        email: user.email,
        createdAt: new Date(),
        orderHistory: []
      }, { merge: true });

      toast.success('Google signup successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2 className="auth-title">Create an Account</h2>
        <div className="auth-input-group">
          <input
            type="text"
            className="auth-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            className="auth-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <input
          type="email"
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Sign Up'}
        </button>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <button type="button" className="auth-button google-button" onClick={handleGoogleSignup} disabled={loading}>
          {loading ? <ClipLoader color="#ffffff" size={20} /> : (
            <>
              <FcGoogle className="google-icon" /> Sign up with Google
            </>
          )}
        </button>
        <Link to="/login" className="auth-link">Already have an account? <span className='link'>Login</span></Link>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Signup;