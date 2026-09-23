import React, { useContext, useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { ThemeContext } from "../context/ThemeContext";
import { assets } from "../../assets/frontend_assets/assets";
import apiRequest from "../../lib/apiRequest";
import {
  Home,
  Menu,
  Heart,
  Phone,
  ShoppingCart,
  User,
  Sun,
  Moon,
  HelpCircle,
  Utensils,
  CircleDollarSign,
  ChevronDown,
  Edit3,
  MapPin,
  Settings,
  LogOut,
  Trash2,
  Shield,
} from "lucide-react";

const Navbar = ({ setShowLogin, setIsLoggedIn }) => {
  const [menu, setMenu] = useState("home");
  const { cartItems, wishlistItems, toggleWishlist, getTotalCartAmount } =
    useContext(StoreContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for storage changes to update user state
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleNavMenuClick = (menuName, id) => {
    setMenu(menuName);
      if (location.pathname !== "/") {
        navigate("/", {state: {scrollTo: id } });
      } else {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
  };

  const handleLogout = async () => {
    try {
      await apiRequest.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      setUser(null);
      if (setIsLoggedIn) {
        setIsLoggedIn(false);
      }
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await apiRequest.delete("/api/user/delete-account");
    } catch (error) {
      console.error("Delete account error:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      setUser(null);
      if (setIsLoggedIn) {
        setIsLoggedIn(false);
      }
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }
  };
  
  // to trigger the dark theme on scroll bar
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const navMenu = (
    <>
      <Link
        to="/"
        onClick={(e) => {
          e.preventDefault();
          setMenu("home");
          if(location.pathname === "/"){
            // already on home, just scroll to top
            window.scrollTo({top: 0, behavior: "smooth"});
          }
          else{
            navigate("/");
          }
        }}
        className={`nav-item ${menu === "home" ? "active" : ""}`}
      >
        <Home size={18} />
        <span>Home</span>
      </Link>
      <Link
        to="/restaurants"
        onClick={() => setMenu("restaurants")}
        className={`nav-item ${menu === "restaurants" ? "active" : ""}`}
      >
        <Utensils size={18} />
        <span>Restaurant</span>
      </Link>
      <Link
        to="/"
        state={{scrollTo: "explore-menu"}}
        onClick={()=> setMenu("menu")}
        className={`nav-item ${menu === "menu" ? "active" : ""}`}
      >
        <Menu size={18} />
        <span>Menu</span>
      </Link>
      <Link
        to="/wishlist"
        onClick={() => setMenu("wishlist")}
        className={`nav-item ${menu === "wishlist" ? "active" : ""}`}
      >
        <Heart size={18} />
        <span>Wishlist</span>
        {Object.keys(wishlistItems).length > 0 && (
  <div className="wishlist-badge">{Object.keys(wishlistItems).length}</div>
)}

      </Link>

      
   <Link
      to="/aboutus"
      onClick={() => setMenu("aboutus")}
      className={`nav-item ${menu === "aboutus" ? "active" : ""}`}
    >
      <HelpCircle size={18} />
      <span>About Us</span>
    </Link>
      <Link
        to="/contact"
        onClick={() => setMenu("contact-us")}
        className={`nav-item ${menu === "contact-us" ? "active" : ""}`}
      >
        <Phone size={18} />
        <span>Contact</span>
      </Link>
       <Link
        to="/referral"
        onClick={() => setMenu("referral")}
        className={`nav-item ${menu === "referral" ? "active" : ""}`}
      >
        <CircleDollarSign size={20} strokeWidth={1.8} />
        
        <span>Refer & Earn</span>
      </Link>
    </>
  );

  const totalCartItems = Object.values(cartItems || {}).reduce(
    (sum, qty) => sum + qty,
    0
  );

  return (
    <>
      {/* Top Navigation Bar */}
      <div className={`navbar ${theme === "dark" ? "navbar-dark" : ""}`}>
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={assets.foodie_icon} alt="app icon" className="app-icon" />
        </Link>

        {/* Desktop menu (center, hidden on mobile) */}
        <nav className="navbar-menu navbar-menu-desktop">{navMenu}</nav>

        {/* Right action buttons */}
        <div className="navbar-right">
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Cart */}
          <div className="navbar-cart">
            <Link to="/cart" className="icon-button" aria-label="Go to cart">
              <ShoppingCart size={18} />
              {totalCartItems > 0 && (
                <div className="cart-badge" >{totalCartItems}</div>
              )}
            </Link>
          </div>

          {/* User / Auth */}
          {user ? (
            <div className="user-menu-container" ref={dropdownRef}>
              <button
                type="button"
                className="user-profile-trigger"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-label="User Account Menu"
              >
                <div className="user-avatar">
                  {(user.name?.[0] || "U").toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-header">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile/me");
                    }}
                  >
                    <User size={15} />
                    <span>View Profile</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile/me?edit=true");
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/addresses");
                    }}
                  >
                    <MapPin size={15} />
                    <span>Saved Addresses</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <Settings size={15} />
                    <span>Settings</span>
                  </button>
                  {user.role === "admin" && (
                    <button
                      type="button"
                      className="dropdown-item"
                      style={{ color: "#ff6347", fontWeight: "600" }}
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/admin");
                      }}
                    >
                      <Shield size={15} />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item dropdown-danger"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={15} />
                    <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="signin-button" onClick={() => setShowLogin(true)}>
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="navbar-menu-mobile">{navMenu}</nav>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-box">
            <h3>Delete Account?</h3>
            <p>Your account will be permanently deleted.</p>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-delete-btn"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
