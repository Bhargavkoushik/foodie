import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  FiMenu, 
  FiX, 
  FiBell, 
  FiChevronDown, 
  FiExternalLink, 
  FiCheckCircle, 
  FiShield,
  FiLogOut
} from 'react-icons/fi';
import apiRequest from '../../../lib/apiRequest';

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest.post('/api/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    setProfileDropdownOpen(false);
    navigate('/admin/login');
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) setAdminUser(stored);
    } catch (e) {
      // ignore
    }
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current page breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return 'Dashboard / Overview';
    }
    if (path === '/admin/foods/add') {
      return 'Food Catalog / Add Food';
    }
    if (path === '/admin/foods') {
      return 'Food Catalog / Food List';
    }
    if (path === '/admin/orders') {
      return 'Management / Orders';
    }
    if (path === '/admin/settings') {
      return 'Management / Settings';
    }
    return 'Dashboard';
  };

  const displayName = adminUser?.name || 'Bhargav Koushik';
  const displayEmail = adminUser?.email || 'admin@foodie.com';
  const initial = displayName.charAt(0).toUpperCase() || 'B';

  return (
    <header className="admin-navbar">
      {/* Left: Mobile Toggle & Brand */}
      <div className="navbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <Link to="/admin" className="navbar-brand">
          <div className="brand-logo-wrap">
            <img src={assets.foodie_icon} alt="Foodie" className="brand-logo-img" />
          </div>
          <div className="brand-titles">
            <div className="brand-title-row">
              <span className="brand-name">Foodie</span>
              <span className="brand-badge">ADMIN</span>
            </div>
            <span className="brand-subtitle">Restaurant Management</span>
          </div>
        </Link>
      </div>

      {/* Center: Dynamic Breadcrumb on desktop */}
      <div className="navbar-center">
        <span className="navbar-breadcrumb">{getBreadcrumb()}</span>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="navbar-right">
        {/* Backend Status indicator */}
        <div className="status-indicator-pill" title="Backend Server Connected">
          <span className="status-live-dot"></span>
          <span className="status-live-text">Live Server</span>
        </div>

        {/* Notification Bell */}
        <div className="notif-wrapper" ref={notifRef}>
          <button
            className="notif-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            title="System Notifications"
          >
            <FiBell size={19} />
            <span className="notif-badge"></span>
          </button>

          {notificationsOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>System Notifications</h4>
                <span className="notif-count">1 New</span>
              </div>
              <div className="notif-body">
                <div className="notif-item unread">
                  <div className="notif-icon-circle">
                    <FiCheckCircle size={16} />
                  </div>
                  <div className="notif-text">
                    <p className="notif-title">Dashboard Live & Connected</p>
                    <p className="notif-time">Connected to Foodie API at port 4000</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Card / Dropdown */}
        <div className="profile-wrapper" ref={dropdownRef}>
          <button
            className="profile-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-expanded={profileDropdownOpen}
          >
            <div className="avatar-circle">
              <span>{initial}</span>
            </div>
            <div className="profile-details">
              <span className="profile-name">{displayName}</span>
              <span className="profile-role">Admin</span>
            </div>
            <FiChevronDown className={`profile-chevron ${profileDropdownOpen ? 'open' : ''}`} size={16} />
          </button>

          {profileDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{initial}</div>
                <div className="dropdown-info">
                  <p className="dropdown-name">{displayName}</p>
                  <p className="dropdown-email">{displayEmail}</p>
                  <span className="dropdown-role-badge">
                    <FiShield size={12} /> Administrator
                  </span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <Link
                to="/"
                className="dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <FiExternalLink size={16} />
                <span>Customer Storefront</span>
              </Link>

              <Link
                to="/admin/settings"
                className="dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <span className="dropdown-settings-icon">⚙️</span>
                <span>Restaurant Settings</span>
              </Link>

              <div className="dropdown-divider"></div>

              <button
                type="button"
                className="dropdown-item dropdown-logout-item"
                onClick={handleLogout}
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
