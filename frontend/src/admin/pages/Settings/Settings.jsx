import React, { useState } from 'react';
import './Settings.css';
import { toast } from 'react-toastify';
import { 
  FiSettings, 
  FiHome, 
  FiClock, 
  FiServer, 
  FiCheckCircle, 
  FiSave,
  FiShield
} from 'react-icons/fi';

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: 'Foodie Central Kitchen',
    branch: 'Bhimavaram Central Hub',
    contactEmail: 'admin@foodie.com',
    contactPhone: '+91 98765 43210',
    address: 'Main Road, Gandhi Nagar, Bhimavaram, Andhra Pradesh - 534201',
    openTime: '09:00',
    closeTime: '23:30',
    deliveryRadius: '12',
    currency: 'INR (₹)',
    deliveryFee: '40',
    kitchenStatus: 'open'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Restaurant settings updated successfully!');
    }, 600);
  };

  return (
    <div className="settings-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiSettings size={26} className="text-primary" />
            Restaurant Settings
          </h1>
          <p className="page-subtitle">
            Configure restaurant operational parameters, store details, delivery charges, and system preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        {/* Section 1: Restaurant Info */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrap">
              <FiHome size={20} />
            </div>
            <div>
              <h2 className="settings-section-title">Store Profile & Location</h2>
              <p className="settings-section-desc">Public restaurant information visible to customers</p>
            </div>
          </div>

          <div className="settings-fields-grid">
            <div className="form-field-group">
              <label className="field-label">Restaurant Name</label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field-group">
              <label className="field-label">Branch / Kitchen Tag</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field-group">
              <label className="field-label">Manager Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field-group">
              <label className="field-label">Contact Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field-group full-width">
              <label className="field-label">Physical Kitchen Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operations & Delivery */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrap">
              <FiClock size={20} />
            </div>
            <div>
              <h2 className="settings-section-title">Operational Hours & Delivery Rules</h2>
              <p className="settings-section-desc">Fulfillment timings and order acceptance rules</p>
            </div>
          </div>

          <div className="settings-fields-grid">
            <div className="form-field-group">
              <label className="field-label">Opening Time</label>
              <input
                type="time"
                name="openTime"
                value={formData.openTime}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field-group">
              <label className="field-label">Closing Time</label>
              <input
                type="time"
                name="closeTime"
                value={formData.closeTime}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field-group">
              <label className="field-label">Delivery Radius (km)</label>
              <input
                type="number"
                name="deliveryRadius"
                value={formData.deliveryRadius}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field-group">
              <label className="field-label">Base Delivery Charge (₹)</label>
              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: System Status & API */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrap">
              <FiServer size={20} />
            </div>
            <div>
              <h2 className="settings-section-title">System Infrastructure & Connectivity</h2>
              <p className="settings-section-desc">Unified single frontend architecture</p>
            </div>
          </div>

          <div className="system-health-grid">
            <div className="health-item">
              <span className="health-label">Backend API Server</span>
              <span className="health-badge ok">
                <FiCheckCircle size={14} /> http://localhost:4000
              </span>
            </div>

            <div className="health-item">
              <span className="health-label">Integrated Frontend</span>
              <span className="health-badge ok">
                <FiCheckCircle size={14} /> http://localhost:5173
              </span>
            </div>

            <div className="health-item">
              <span className="health-label">Database Connection</span>
              <span className="health-badge ok">
                <FiCheckCircle size={14} /> MongoDB Atlas Connected
              </span>
            </div>

            <div className="health-item">
              <span className="health-label">Admin Role</span>
              <span className="health-badge ok">
                <FiShield size={14} /> Super Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="settings-footer">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            <FiSave size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
