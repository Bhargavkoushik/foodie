import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import apiRequest from '../../../lib/apiRequest';
import { assets } from '../../../assets/frontend_assets/assets';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated as an admin, redirect straight to /admin
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (token && user?.role === 'admin') {
        navigate('/admin', { replace: true });
      }
    } catch {
      // ignore parse error
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest.post('/api/auth/login', {
        email: trimmedEmail,
        password
      });

      if (res.data?.success) {
        const user = res.data.user;
        const token = res.data.token;

        // Verify that the user has admin role
        if (user && user.role === 'admin') {
          localStorage.setItem('authToken', token);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('storage'));
          navigate('/admin', { replace: true });
        } else {
          // Reject normal customer login into admin portal
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('storage'));
          setError('Admin access required for this login.');
        }
      } else {
        setError(res.data?.message || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Header / Brand */}
        <div className="admin-login-brand">
          <div className="admin-login-logo-circle">
            <img src={assets.foodie_icon} alt="Foodie Logo" className="admin-login-logo" />
          </div>
          <div className="admin-login-badge">
            <FiShield size={14} />
            <span>ADMIN CONSOLE</span>
          </div>
          <h1 className="admin-login-title">Foodie Admin Portal</h1>
          <p className="admin-login-subtitle">
            Sign in with authorized administrator credentials to manage restaurants, menus, and orders.
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="admin-login-error" role="alert">
            <FiAlertCircle size={18} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="form-group">
            <label htmlFor="admin-email">Administrator Email</label>
            <div className="input-container">
              <FiMail className="input-icon" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@foodie.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="input-container">
              <FiLock className="input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <span>Sign In to Admin Dashboard</span>
            )}
          </button>
        </form>

        {/* Storefront Return Navigation */}
        <div className="admin-login-footer">
          <Link to="/" className="back-to-store-link">
            <FiArrowLeft size={14} />
            <span>Return to Foodie Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
