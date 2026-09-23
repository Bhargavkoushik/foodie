import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminGuard = ({ children }) => {
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');

  // Check if authenticated
  if (!token || !userStr) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      // Normal user trying to access admin
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '1rem'
          }}>
            🚫
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Access Denied
          </h2>
          <p style={{ color: '#64748b', maxWidth: '440px', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            You do not have administrative privileges to access the Foodie Admin Dashboard. Please log in with an authorized administrator account.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href="/admin/login"
              style={{
                display: 'inline-flex',
                padding: '10px 22px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign in as Admin
            </a>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                padding: '10px 22px',
                backgroundColor: '#ff6347',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Return to Storefront
            </a>
          </div>
        </div>
      );
    }
  } catch (e) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminGuard;
