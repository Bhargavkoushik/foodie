import React, { useState, useEffect, useCallback } from 'react';
import apiRequest from '../../../lib/apiRequest';
import { toast } from 'react-toastify';
import './Orders.css';
import { 
  FiPackage, 
  FiClock, 
  FiTruck, 
  FiCheckCircle, 
  FiXCircle, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiEye, 
  FiTrash2, 
  FiMapPin, 
  FiUser, 
  FiX, 
  FiAlertTriangle,
  FiShoppingBag
} from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest.get('/api/order/all');
      if (res.data.success) {
        setOrders(res.data.orders || res.data.data || []);
      } else {
        toast.error(res.data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Unable to fetch orders from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await apiRequest.post('/api/order/status', { 
        orderId, 
        status: newStatus 
      });

      if (res.data.success) {
        toast.success(`Order status updated to "${newStatus}"`);
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error(res.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExecuteDelete = async () => {
    if (!orderToDelete) return;
    const orderId = orderToDelete._id;

    try {
      setDeletingId(orderId);
      const res = await apiRequest.post('/api/order/delete', { orderId });
      if (res.data.success) {
        toast.success('Order removed successfully');
        setOrders((prev) => prev.filter((ord) => ord._id !== orderId));
        setOrderToDelete(null);
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        toast.error(res.data.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Delete order error:', error);
      toast.error('Error deleting order record');
    } finally {
      setDeletingId(null);
    }
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

  const totalCount = orders.length;
  const processingCount = orders.filter((o) => o.status === 'Food Processing').length;
  const deliveryCount = orders.filter((o) => o.status === 'Out for delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  const filteredOrders = orders.filter((order) => {
    const customer = getCustomerName(order).toLowerCase();
    const orderId = (order._id || '').toLowerCase();
    const city = (order.address?.city || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = customer.includes(searchLower) ||
      orderId.includes(searchLower) ||
      city.includes(searchLower);

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const totalFiltered = filteredOrders.length;
  const noOfPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const start = currentPage * PAGE_SIZE;
  const currentOrders = filteredOrders.slice(start, start + PAGE_SIZE);

  return (
    <div className="orders-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiPackage size={26} className="text-primary" />
            Customer Orders
          </h1>
          <p className="page-subtitle">
            Manage real-time incoming customer orders, dispatch status, and kitchen fulfillment.
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={fetchAllOrders}
          disabled={loading}
          title="Refresh Orders"
        >
          <FiRefreshCw className={loading ? 'spinning' : ''} size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Summary Metric Cards */}
      <div className="order-metrics-grid">
        <button
          className={`order-metric-card ${statusFilter === 'All' ? 'active' : ''}`}
          onClick={() => { setStatusFilter('All'); setCurrentPage(0); }}
        >
          <div className="metric-icon-wrap icon-all">
            <FiPackage size={20} />
          </div>
          <div className="metric-text-wrap">
            <span className="metric-label">All Orders</span>
            <span className="metric-value">{totalCount}</span>
          </div>
        </button>

        <button
          className={`order-metric-card ${statusFilter === 'Food Processing' ? 'active' : ''}`}
          onClick={() => { setStatusFilter('Food Processing'); setCurrentPage(0); }}
        >
          <div className="metric-icon-wrap icon-pending">
            <FiClock size={20} />
          </div>
          <div className="metric-text-wrap">
            <span className="metric-label">Processing</span>
            <span className="metric-value">{processingCount}</span>
          </div>
        </button>

        <button
          className={`order-metric-card ${statusFilter === 'Out for delivery' ? 'active' : ''}`}
          onClick={() => { setStatusFilter('Out for delivery'); setCurrentPage(0); }}
        >
          <div className="metric-icon-wrap icon-delivery">
            <FiTruck size={20} />
          </div>
          <div className="metric-text-wrap">
            <span className="metric-label">Out for Delivery</span>
            <span className="metric-value">{deliveryCount}</span>
          </div>
        </button>

        <button
          className={`order-metric-card ${statusFilter === 'Delivered' ? 'active' : ''}`}
          onClick={() => { setStatusFilter('Delivered'); setCurrentPage(0); }}
        >
          <div className="metric-icon-wrap icon-delivered">
            <FiCheckCircle size={20} />
          </div>
          <div className="metric-text-wrap">
            <span className="metric-label">Delivered</span>
            <span className="metric-value">{deliveredCount}</span>
          </div>
        </button>

        <button
          className={`order-metric-card ${statusFilter === 'Cancelled' ? 'active' : ''}`}
          onClick={() => { setStatusFilter('Cancelled'); setCurrentPage(0); }}
        >
          <div className="metric-icon-wrap icon-cancelled">
            <FiXCircle size={20} />
          </div>
          <div className="metric-text-wrap">
            <span className="metric-label">Cancelled</span>
            <span className="metric-value">{cancelledCount}</span>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="orders-toolbar-card">
        <div className="orders-search-box">
          <FiSearch className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by customer name, order ID, or city..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
            className="orders-search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear Search"
            >
              <FiX size={15} />
            </button>
          )}
        </div>

        <div className="orders-status-dropdown-wrap">
          <FiFilter size={16} className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            className="orders-filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="Food Processing">Food Processing</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="orders-count-text">
          Showing {currentOrders.length} of {totalFiltered} orders
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="orders-table-card">
        {loading ? (
          <div className="orders-state-box">
            <FiRefreshCw className="spinning" size={28} />
            <p>Loading orders from database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-state-box empty">
            <FiShoppingBag size={48} />
            <h3>No orders found</h3>
            <p>
              {orders.length === 0
                ? 'No customer orders have been received yet. Orders placed on the website will appear here automatically.'
                : 'No orders match your filter criteria or search keyword.'}
            </p>
            {(statusFilter !== 'All' || searchTerm) && (
              <button
                className="btn-secondary"
                onClick={() => { setStatusFilter('All'); setSearchTerm(''); }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="orders-data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer & Destination</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Placed At</th>
                  <th>Fulfillment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => {
                  const displayId = order._id ? `#${order._id.slice(-6).toUpperCase()}` : '#ORD';
                  const customer = getCustomerName(order);
                  const amount = Number(order.totalAmount || order.price || 0).toFixed(2);
                  const status = order.status || 'Food Processing';
                  const date = formatDate(order.createdAt);
                  const isUpdating = updatingId === order._id;

                  let itemsSummary = 'Items';
                  if (Array.isArray(order.items) && order.items.length > 0) {
                    const firstFew = order.items.slice(0, 2).map((it) => `${it.name} (${it.quantity || 1})`).join(', ');
                    const extra = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';
                    itemsSummary = firstFew + extra;
                  }

                  return (
                    <tr key={order._id || order.id}>
                      <td>
                        <span className="order-id-code" title={order._id}>
                          {displayId}
                        </span>
                      </td>
                      <td>
                        <div className="customer-info-col">
                          <span className="customer-name-text">{customer}</span>
                          <span className="customer-city-text">
                            {order.address?.city 
                              ? `${order.address.city}${order.address?.state ? `, ${order.address.state}` : ''}`
                              : 'Bhimavaram'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="items-summary-text" title={itemsSummary}>
                          {itemsSummary}
                        </span>
                      </td>
                      <td>
                        <span className="order-total-price">₹{amount}</span>
                      </td>
                      <td>
                        <span className="order-time-text">{date}</span>
                      </td>
                      <td>
                        <div className="status-selector-container">
                          {isUpdating ? (
                            <span className="updating-status-pill">
                              <FiRefreshCw className="spinning" size={13} />
                              <span>Updating...</span>
                            </span>
                          ) : (
                            <select
                              value={status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`order-status-badge-select ${getStatusBadgeClass(status)}`}
                            >
                              <option value="Food Processing">🟡 Food Processing</option>
                              <option value="Out for delivery">🔵 Out for delivery</option>
                              <option value="Delivered">🟢 Delivered</option>
                              <option value="Cancelled">🔴 Cancelled</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-wrap">
                          <button
                            className="order-action-btn view-btn"
                            onClick={() => setSelectedOrder(order)}
                            title="View Complete Order Details"
                          >
                            <FiEye size={15} />
                            <span>Details</span>
                          </button>
                          <button
                            className="order-action-btn delete-btn"
                            onClick={() => setOrderToDelete(order)}
                            title="Delete Order Record"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {noOfPages > 1 && (
          <div className="orders-pagination-bar">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="pagination-arrow-btn"
            >
              Previous
            </button>

            <div className="pagination-numbers">
              {[...Array(noOfPages).keys()].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`page-num-btn ${currentPage === p ? 'active' : ''}`}
                >
                  {p + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(noOfPages - 1, p + 1))}
              disabled={currentPage === noOfPages - 1}
              className="pagination-arrow-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  Order #{selectedOrder._id ? selectedOrder._id.slice(-6).toUpperCase() : 'DETAILS'}
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
              <div className="modal-info-grid">
                <div className="info-box">
                  <h4><FiUser size={15} /> Customer Details</h4>
                  <p><strong>Name:</strong> {getCustomerName(selectedOrder)}</p>
                  {selectedOrder.userId?.email && (
                    <p><strong>Email:</strong> {selectedOrder.userId.email}</p>
                  )}
                  {selectedOrder.address?.phone && (
                    <p><strong>Phone:</strong> {selectedOrder.address.phone}</p>
                  )}
                </div>

                <div className="info-box">
                  <h4><FiMapPin size={15} /> Delivery Destination</h4>
                  {selectedOrder.address ? (
                    <>
                      <p>{selectedOrder.address.street || 'Street Address'}</p>
                      <p>
                        {[
                          selectedOrder.address.city,
                          selectedOrder.address.state,
                          selectedOrder.address.zipcode
                        ].filter(Boolean).join(', ') || 'Andhra Pradesh, India'}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted">Standard Delivery Address</p>
                  )}
                </div>
              </div>

              <div className="modal-items-section">
                <h4>Items Ordered</h4>
                <div className="modal-items-list">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="modal-item-row">
                        <div className="modal-item-name-wrap">
                          <span className="modal-item-name">{it.name}</span>
                          <span className="modal-item-qty">× {it.quantity || 1}</span>
                        </div>
                        <span className="modal-item-price">
                          ₹{((Number(it.price) || 0) * (Number(it.quantity) || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-items-text">Items summary not available</p>
                  )}
                </div>

                <div className="modal-total-row">
                  <span>Grand Total</span>
                  <span className="modal-total-amount">
                    ₹{Number(selectedOrder.totalAmount || selectedOrder.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="modal-status-section">
                <label className="modal-status-label">Update Order Status:</label>
                <select
                  value={selectedOrder.status || 'Food Processing'}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className={`modal-status-select ${getStatusBadgeClass(selectedOrder.status)}`}
                  disabled={updatingId === selectedOrder._id}
                >
                  <option value="Food Processing">🟡 Food Processing</option>
                  <option value="Out for delivery">🔵 Out for delivery</option>
                  <option value="Delivered">🟢 Delivered</option>
                  <option value="Cancelled">🔴 Cancelled</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Dialog */}
      {orderToDelete && (
        <div className="modal-backdrop" onClick={() => setOrderToDelete(null)}>
          <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <FiAlertTriangle size={32} />
            </div>
            <h3 className="delete-modal-title">Delete Order Record</h3>
            <p className="delete-modal-desc">
              Are you sure you want to permanently delete order{' '}
              <strong>#{orderToDelete._id ? orderToDelete._id.slice(-6).toUpperCase() : ''}</strong>?
            </p>
            <p className="delete-modal-warning">
              This will remove the order from the database permanently.
            </p>

            <div className="delete-modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setOrderToDelete(null)}
                disabled={deletingId === orderToDelete._id}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="confirm-delete-btn" 
                onClick={handleExecuteDelete}
                disabled={deletingId === orderToDelete._id}
              >
                {deletingId === orderToDelete._id ? (
                  <>
                    <FiRefreshCw className="spinning" size={14} />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 size={15} />
                    <span>Delete Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
