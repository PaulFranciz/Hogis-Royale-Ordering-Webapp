import React, { useState } from 'react';
import { auth } from '../Firebase/FirebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import forgotPasswordImg from '/Forgot password-amico.svg'
import './Auth-styles.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Check your inbox.');
      setError(null);
    } catch (error) {
      setError(error.message);
      setMessage(null);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image-container">
        <img src={forgotPasswordImg} alt="Forgot Password" className="auth-image" />
      </div>
      <form className="auth-form" onSubmit={handleResetPassword}>
        <h2 className="auth-title">Forgot Password</h2>
        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}
        <input
          type="email"
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="auth-button">Reset Password</button>
        <Link to="/login" className="auth-link">Back to Login</Link>
      </form>
    </div>
  );
}

export default ForgotPassword;