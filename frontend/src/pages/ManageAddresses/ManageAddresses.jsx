import React, { useState, useEffect } from "react";
import "./ManageAddresses.css";
import { toast } from "react-toastify";
import { Plus, MapPin, Edit2, Trash2, CheckCircle2 } from "lucide-react";

const getStorageKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.email ? `foodie_addresses_${user.email}` : "foodie_addresses_guest";
  } catch {
    return "foodie_addresses_guest";
  }
};

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    tag: "Home",
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    isDefault: false
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(getStorageKey())) || [];
      setAddresses(stored);
    } catch {
      setAddresses([]);
    }
  }, []);

  const saveToStorage = (updatedList) => {
    setAddresses(updatedList);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedList));
  };

  const handleOpenAdd = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const names = (user.name || "").split(" ");
      setFormData({
        ...initialForm,
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        email: user.email || "",
        isDefault: addresses.length === 0
      });
    } catch {
      setFormData(initialForm);
    }
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (addr) => {
    setFormData({ ...addr });
    setEditingId(addr.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveToStorage(updated);
    toast.success("Address removed successfully!");
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    saveToStorage(updated);
    toast.success("Default address updated!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.street || !formData.city || !formData.phone) {
      toast.error("Please fill in the required fields");
      return;
    }

    let updatedList = [];
    if (editingId) {
      updatedList = addresses.map((a) =>
        a.id === editingId
          ? { ...formData, id: editingId }
          : formData.isDefault
          ? { ...a, isDefault: false }
          : a
      );
      toast.success("Address updated successfully!");
    } else {
      const newAddress = {
        ...formData,
        id: Date.now().toString()
      };
      if (newAddress.isDefault || addresses.length === 0) {
        newAddress.isDefault = true;
        updatedList = [...addresses.map((a) => ({ ...a, isDefault: false })), newAddress];
      } else {
        updatedList = [...addresses, newAddress];
      }
      toast.success("New address saved successfully!");
    }

    saveToStorage(updatedList);
    setShowModal(false);
  };

  return (
    <div className="manage-addresses">
      <div className="addresses-header">
        <div>
          <h1>Saved Delivery Addresses</h1>
          <p style={{ color: "var(--text-color, #6b7280)", fontSize: "14px", marginTop: "4px" }}>
            Manage your delivery locations for fast checkout
          </p>
        </div>
        <button className="add-address-btn" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-addresses">
          <MapPin size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <h3>No saved addresses yet</h3>
          <p>Add your home or office address to save time during checkout.</p>
          <button className="add-address-btn" style={{ margin: "16px auto 0" }} onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Address</span>
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map((addr) => (
            <div key={addr.id} className={`address-card ${addr.isDefault ? "default" : ""}`}>
              <div>
                <div className="address-card-header">
                  <span className="address-card-title">{addr.tag || "Address"}</span>
                  {addr.isDefault && <span className="default-badge">DEFAULT</span>}
                </div>
                <div className="address-card-body">
                  <p>
                    <b>
                      {addr.firstName} {addr.lastName}
                    </b>
                  </p>
                  <p>{addr.street}</p>
                  <p>
                    {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                  <p>{addr.country}</p>
                  <p style={{ marginTop: "6px" }}>📞 {addr.phone}</p>
                  {addr.email && <p>✉️ {addr.email}</p>}
                </div>
              </div>

              <div className="address-card-actions">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)}>Set Default</button>
                )}
                <button onClick={() => handleOpenEdit(addr)}>
                  <Edit2 size={13} style={{ display: "inline", marginRight: "4px" }} />
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(addr.id)}>
                  <Trash2 size={13} style={{ display: "inline", marginRight: "4px" }} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="address-modal-overlay">
          <div className="address-modal-box">
            <h2>{editingId ? "Edit Address" : "Add New Address"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="address-form-grid">
                <div className="address-form-field">
                  <label>Address Label / Tag*</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  >
                    <option value="Home">Home</option>
                    <option value="Work / Office">Work / Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="address-form-field">
                  <label>Phone Number*</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="address-form-field">
                  <label>First Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="address-form-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div className="address-form-field full-width">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="address-form-field full-width">
                  <label>Street Address*</label>
                  <input
                    type="text"
                    required
                    placeholder="House number, Street name"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>
                <div className="address-form-field">
                  <label>City*</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="address-form-field">
                  <label>State*</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="address-form-field">
                  <label>Zip Code*</label>
                  <input
                    type="text"
                    required
                    placeholder="Zip / Postal Code"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
                <div className="address-form-field">
                  <label>Country*</label>
                  <input
                    type="text"
                    required
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="address-form-checkbox">
                <input
                  type="checkbox"
                  id="makeDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                <label htmlFor="makeDefault">Make this my default delivery address</label>
              </div>

              <div className="address-modal-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAddresses;
