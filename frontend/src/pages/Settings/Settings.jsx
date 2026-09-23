import React, { useState, useContext, useEffect } from "react";
import "./Settings.css";
import { ThemeContext } from "../../components/context/ThemeContext";
import apiRequest from "../../lib/apiRequest";
import { toast } from "react-toastify";
import { Sun, Moon, Bell, Lock, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Notification Preferences
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem("foodie_notification_prefs");
      return stored ? JSON.parse(stored) : { orderUpdates: true, promoEmails: false };
    } catch {
      return { orderUpdates: true, promoEmails: false };
    }
  });

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem("foodie_notification_prefs", JSON.stringify(updated));
    toast.success("Notification preferences saved");
  };

  // Change Password
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Please fill in current and new password");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await apiRequest.patch("/api/user/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      if (res.data.success) {
        toast.success(res.data.message || "Password changed successfully!");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: ""
        });
      } else {
        toast.error(res.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      const msg = error.response?.data?.message || "Failed to change password. Check your current password.";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await apiRequest.delete("/api/user/delete-account");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Delete account error:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p style={{ color: "var(--text-color, #6b7280)", fontSize: "14px", marginTop: "4px" }}>
          Manage your account appearance, security, and notification preferences
        </p>
      </div>

      {/* Appearance / Theme */}
      <div className="settings-section">
        <h2>Appearance</h2>
        <p className="settings-desc">Customize how Foodie looks on your device</p>
        <div className="settings-row">
          <div className="settings-row-info">
            <h4>Theme Mode</h4>
            <p>Currently using {theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
          </div>
          <button className="settings-theme-btn" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span>Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-section">
        <h2>Notification Preferences</h2>
        <p className="settings-desc">Choose what updates you want to receive</p>
        <div className="settings-row">
          <div className="settings-row-info">
            <h4>Order Status Notifications</h4>
            <p>Get instant updates on food preparation and delivery progress</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={notifications.orderUpdates}
              onChange={() => handleNotificationToggle("orderUpdates")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <h4>Promotions & Special Offers</h4>
            <p>Receive weekly discounts, promo codes, and special chef menus</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={notifications.promoEmails}
              onChange={() => handleNotificationToggle("promoEmails")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Change Password */}
      <div className="settings-section">
        <h2>Change Password</h2>
        <p className="settings-desc">Update your security credentials regularly</p>
        <form className="password-form" onSubmit={handlePasswordChange}>
          <div className="password-form-field">
            <label>Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="password-form-field">
            <label>New Password (min 6 characters)</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="password-form-field">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwords.confirmNewPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="change-pw-btn" disabled={isChangingPassword}>
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="settings-section danger-section">
        <h2>Danger Zone</h2>
        <p className="settings-desc">Permanently remove your account and all associated data</p>
        <div className="settings-row">
          <div className="settings-row-info">
            <h4>Delete Account</h4>
            <p>Once deleted, your order history, profile, and settings cannot be recovered</p>
          </div>
          <button className="delete-account-btn" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default Settings;
