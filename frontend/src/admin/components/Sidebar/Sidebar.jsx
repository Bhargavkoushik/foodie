import React from 'react';
import './Sidebar.css';
import { NavLink, Link } from 'react-router-dom';
import { 
  FiGrid, 
  FiPlusCircle, 
  FiList, 
  FiPackage, 
  FiSettings, 
  FiExternalLink
} from 'react-icons/fi';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const closeMobileMenu = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: <FiGrid size={20} />,
      end: true
    },
    {
      to: '/admin/foods',
      label: 'Food List',
      icon: <FiList size={20} />,
      end: true
    },
    {
      to: '/admin/foods/add',
      label: 'Add Food',
      icon: <FiPlusCircle size={20} />,
      end: true
    },
    {
      to: '/admin/orders',
      label: 'Orders',
      icon: <FiPackage size={20} />,
      end: false
    },
    {
      to: '/admin/settings',
      label: 'Settings',
      icon: <FiSettings size={20} />,
      end: false
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-container">
          {/* Section title */}
          <div className="sidebar-group-title">
            <span>ADMIN NAVIGATION</span>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <div className="sidebar-link-icon">{item.icon}</div>
                <span className="sidebar-link-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Quick Restaurant Summary Card */}
          <div className="sidebar-footer-card">
            <div className="store-badge">
              <span className="store-dot"></span>
              <span className="store-label">Kitchen Active</span>
            </div>
            <p className="store-name">Foodie Central</p>
            <p className="store-location">Bhimavaram Hub</p>
            <Link
              to="/"
              className="store-visit-link"
              onClick={closeMobileMenu}
            >
              <span>Customer Store</span>
              <FiExternalLink size={13} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
