import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import apiRequest from '../../../lib/apiRequest';
import { Link } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiPackage, 
  FiClock, 
  FiDollarSign, 
  FiPlus, 
  FiArrowRight, 
  FiRefreshCw, 
  FiEye, 
  FiAlertCircle,
  FiX,
  FiMapPin,
  FiUser
} from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';

const Dashboard = () => {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [foodRes, orderRes] = await Promise.all([
        apiRequest.get('/api/food/list'),
        apiRequest.get('/api/order/all')
      ]);

      if (foodRes.data.success) {
        setFoods(foodRes.data.data || []);
      }

      if (orderRes.data.success) {
        setOrders(orderRes.data.orders || orderRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Unable to load dashboard data. Please check your connection or permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived real calculations
  const totalFoods = foods.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Food Processing').length;
  const outForDelivery = orders.filter((o) => o.status === 'Out for delivery').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount || o.price) || 0), 0);

  // Recent 5 orders
  const recentOrders = orders.slice(0, 5);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Food Processing':
        return 'status-pending';
      case 'Out for delivery':
        return 'status-out-for-delivery';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCustomerName = (order) => {
    if (order.userId && typeof order.userId === 'object' && order.userId.name) {
      return order.userId.name;
    }
    if (order.address && (order.address.firstName || order.address.lastName)) {
      return `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim();
    }
    if (order.user) return order.user;
    return 'Customer';
  };

  const getItemCount = (order) => {
    if (!order.items) return '0 items';
    if (Array.isArray(order.items)) {
      const count = order.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
      return `${count} ${count === 1 ? 'item' : 'items'}`;
    }
    return 'Items';
  };

  return (
    <div className="dashboard-page">
      {/* Top Banner & Refresh */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1 className="hero-title">Restaurant Overview</h1>
          <p className="hero-subtitle">
            Welcome to the <strong>Foodie Admin</strong> live management dashboard.
          </p>
        </div>
        <div className="hero-actions">
          <button 
            className="btn-secondary refresh-btn"
            onClick={fetchData}
            disabled={loading}
            title="Refresh Data"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} size={15} />
            <span>Refresh</span>
          </button>
          <Link to="/admin/foods/add" className="btn-primary">
            <FiPlus size={16} />
            <span>Add New Food</span>
          </Link>
        </div>
      </div>

      {/* Error state if API failed */}
      {error && (
        <div className="dashboard-alert-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchData} className="alert-retry-btn">Retry</button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="stats-grid">
        {/* Card 1: Total Foods */}
        <Link to="/admin/foods" className="stat-card">
          <div className="stat-card-icon-wrap icon-foods">
            <IoFastFoodOutline size={26} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Foods</span>
            <div className="stat-card-value">
              {loading ? <span className="skeleton-text">--</span> : totalFoods}
            </div>
            <span className="stat-card-footer">
              <span>View catalog</span>
              <FiArrowRight size={13} />
            </span>
          </div>
        </Link>

        {/* Card 2: Total Orders */}
        <Link to="/admin/orders" className="stat-card">
          <div className="stat-card-icon-wrap icon-orders">
            <FiPackage size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Orders</span>
            <div className="stat-card-value">
              {loading ? <span className="skeleton-text">--</span> : totalOrders}
            </div>
            <span className="stat-card-footer">
              <span>{deliveredOrders} delivered</span>
              <FiArrowRight size={13} />
            </span>
          </div>
        </Link>

        {/* Card 3: Pending Orders */}
        <Link to="/admin/orders" className="stat-card">
          <div className="stat-card-icon-wrap icon-pending">
            <FiClock size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Pending Orders</span>
            <div className="stat-card-value">
              {loading ? <span className="skeleton-text">--</span> : pendingOrders}
            </div>
            <span className="stat-card-footer">
              <span>{outForDelivery} in delivery</span>
              <FiArrowRight size={13} />
            </span>
          </div>
        </Link>

        {/* Card 4: Total Revenue */}
        <div className="stat-card revenue-card">
          <div className="stat-card-icon-wrap icon-revenue">
            <FiDollarSign size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Revenue</span>
            <div className="stat-card-value">
              {loading ? <span className="skeleton-text">--</span> : `₹${totalRevenue.toLocaleString('en-IN')}`}
            </div>
            <span className="stat-card-footer success">
              <span>Real order volume</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Quick Management */}
      <div className="dashboard-content-split">
        {/* Left: Recent Orders Card */}
        <div className="dashboard-section recent-orders-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Recent Orders</h2>
              <p className="section-card-desc">Latest customer orders requiring kitchen fulfillment</p>
            </div>
            <Link to="/admin/orders" className="section-card-link">
              <span>All Orders</span>
              <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="dashboard-loading-state">
                <FiRefreshCw className="spinning" size={24} />
                <p>Loading real-time orders...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="dashboard-empty-state">
                <FiShoppingBag size={42} />
                <h3>No orders placed yet</h3>
                <p>When customers order from the Foodie store, they will appear here in real-time.</p>
                <Link to="/" className="btn-secondary empty-store-btn">
                  Visit Storefront
                </Link>
              </div>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const displayId = order._id ? `#${order._id.slice(-6).toUpperCase()}` : '#ORD';
                    const customer = getCustomerName(order);
                    const items = getItemCount(order);
                    const amount = Number(order.totalAmount || order.price || 0).toFixed(2);
                    const status = order.status || 'Food Processing';
                    const date = formatDate(order.createdAt);

                    return (
                      <tr key={order._id || order.id}>
                        <td>
                          <span className="order-id-badge" title={order._id}>
                            {displayId}
                          </span>
                        </td>
                        <td>
                          <span className="customer-cell-name">{customer}</span>
                        </td>
                        <td>
                          <span className="order-items-count">{items}</span>
                        </td>
                        <td>
                          <span className="order-amount-text">₹{amount}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <span className="order-date-text">{date}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="table-action-btn"
                            onClick={() => setSelectedOrder(order)}
                            title="View Full Order Details"
                          >
                            <FiEye size={14} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Quick Restaurant Management Shortcuts */}
        <div className="dashboard-section shortcuts-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Quick Actions</h2>
              <p className="section-card-desc">Common restaurant administrative tasks</p>
            </div>
          </div>

          <div className="quick-actions-list">
            <Link to="/admin/foods/add" className="quick-action-item">
              <div className="quick-action-icon add-food-icon">
                <FiPlus size={20} />
              </div>
              <div className="quick-action-info">
                <h4>Add New Dish</h4>
                <p>Upload image, set price, and add food item</p>
              </div>
              <FiArrowRight className="action-chevron" size={16} />
            </Link>

            <Link to="/admin/foods" className="quick-action-item">
              <div className="quick-action-icon menu-icon">
                <IoFastFoodOutline size={20} />
              </div>
              <div className="quick-action-info">
                <h4>Manage Catalog</h4>
                <p>Search, filter, or delete active menu items</p>
              </div>
              <FiArrowRight className="action-chevron" size={16} />
            </Link>

            <Link to="/admin/orders" className="quick-action-item">
              <div className="quick-action-icon order-icon">
                <FiPackage size={20} />
              </div>
              <div className="quick-action-info">
                <h4>Order Management</h4>
                <p>Update delivery progress and handle cancellations</p>
              </div>
              <FiArrowRight className="action-chevron" size={16} />
            </Link>

            <div className="restaurant-status-box">
              <div className="status-box-header">
                <span className="status-dot-active"></span>
                <h5>Kitchen Status: Online</h5>
              </div>
              <p>Receiving orders from Foodie customer website live</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  Order Details {selectedOrder._id ? `#${selectedOrder._id.slice(-6).toUpperCase()}` : ''}
                </h3>
                <span className="modal-date">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedOrder(null)}
                aria-label="Close Modal"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Customer and Delivery info */}
              <div className="modal-info-grid">
                <div className="info-box">
                  <h4><FiUser size={14} /> Customer Information</h4>
                  <p><strong>Name:</strong> {getCustomerName(selectedOrder)}</p>
                  {selectedOrder.userId?.email && (
                    <p><strong>Email:</strong> {selectedOrder.userId.email}</p>
                  )}
                  {selectedOrder.address?.phone && (
                    <p><strong>Phone:</strong> {selectedOrder.address.phone}</p>
                  )}
                </div>

                <div className="info-box">
                  <h4><FiMapPin size={14} /> Delivery Address</h4>
                  {selectedOrder.address ? (
                    <>
                      <p>{selectedOrder.address.street || 'Address Street'}</p>
                      <p>
                        {[
                          selectedOrder.address.city,
                          selectedOrder.address.state,
                          selectedOrder.address.zipcode
                        ].filter(Boolean).join(', ') || 'Metropolis, India'}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted">No address provided</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="modal-items-section">
                <h4>Ordered Items</h4>
                <div className="modal-items-list">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="modal-item-row">
                        <div className="modal-item-name-wrap">
                          <span className="modal-item-name">{it.name}</span>
                          <span className="modal-item-qty">Qty: {it.quantity || 1}</span>
                        </div>
                        <span className="modal-item-price">
                          ₹{((Number(it.price) || 0) * (Number(it.quantity) || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-items-text">Item breakdown not available for this record.</p>
                  )}
                </div>

                <div className="modal-total-row">
                  <span>Grand Total</span>
                  <span className="modal-total-amount">
                    ₹{Number(selectedOrder.totalAmount || selectedOrder.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                Current Status: {selectedOrder.status || 'Food Processing'}
              </span>
              <button 
                className="btn-primary" 
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
