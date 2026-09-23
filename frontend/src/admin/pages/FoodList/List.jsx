import React, { useState, useEffect, useCallback } from 'react';
import apiRequest from '../../../lib/apiRequest';
import { toast } from 'react-toastify';
import './List.css';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiPlus, 
  FiTrash2, 
  FiRefreshCw, 
  FiAlertTriangle, 
  FiX, 
  FiFilter,
  FiShoppingBag
} from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';

const List = () => {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const categories = [
    'All',
    'Salad',
    'Rolls',
    'Pizza',
    'Burger',
    'Pasta',
    'Dessert',
    'Noodles',
    'Sandwich',
    'Cake',
    'Pure Veg'
  ];

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get('/api/food/list');
      if (response.data.success) {
        setList(response.data.data || []);
      } else {
        toast.error('Failed to retrieve food items.');
      }
    } catch (error) {
      console.error('Fetch list error:', error);
      toast.error('Unable to fetch food list from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const confirmDelete = (item) => {
    setItemToDelete(item);
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    const foodId = itemToDelete._id;

    try {
      setDeletingId(foodId);
      const response = await apiRequest.post('/api/food/remove', { id: foodId });

      if (response.data.success) {
        toast.success(response.data.message || 'Food item removed successfully.');
        setList((prev) => prev.filter((item) => item._id !== foodId));
        setItemToDelete(null);
      } else {
        toast.error(response.data.message || 'Failed to remove food item.');
      }
    } catch (error) {
      console.error('Remove food error:', error);
      toast.error(error.response?.data?.message || 'Error removing food item.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered foods based on search and category
  const filteredList = list.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="food-list-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <IoFastFoodOutline size={26} className="text-primary" />
            Food Catalog
          </h1>
          <p className="page-subtitle">
            Manage your restaurant food catalog, update stock status, and view pricing.
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary" 
            onClick={fetchList} 
            disabled={loading}
            title="Refresh Catalog"
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

      {/* Filter and Search Controls Bar */}
      <div className="catalog-controls-card">
        <div className="search-filter-wrap">
          {/* Search Box */}
          <div className="search-box">
            <FiSearch className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by food name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-field"
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

          {/* Category Dropdown */}
          <div className="category-filter-wrap">
            <FiFilter size={16} className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-dropdown"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="catalog-count-pill">
          <span>{filteredList.length} of {list.length} dishes</span>
        </div>
      </div>

      {/* Catalog Table Card */}
      <div className="catalog-table-card">
        {loading ? (
          <div className="catalog-state-box">
            <FiRefreshCw className="spinning" size={28} />
            <p>Loading food catalog...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="catalog-state-box empty">
            <FiShoppingBag size={48} />
            <h3>No food items found</h3>
            <p>
              {list.length === 0 
                ? 'Your restaurant catalog is currently empty. Add your first food item.'
                : 'No food items matched your search query or selected category filter.'
              }
            </p>
            {list.length === 0 ? (
              <Link to="/admin/foods/add" className="btn-primary">
                <FiPlus size={16} />
                <span>Add First Food Item</span>
              </Link>
            ) : (
              <button 
                className="btn-secondary"
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="food-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="food-img-cell">
                        <img
                          src={
                            item.image
                              ? item.image.startsWith('http')
                                ? item.image
                                : `http://localhost:4000/images/${item.image}`
                              : 'https://via.placeholder.com/60?text=Food'
                          }
                          alt={item.name}
                          className="food-thumbnail"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/60?text=Food';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="food-details-cell">
                        <span className="food-item-name">{item.name}</span>
                        {item.description && (
                          <span className="food-item-desc" title={item.description}>
                            {item.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{item.category || 'General'}</span>
                    </td>
                    <td>
                      <span className="food-price-text">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="delete-item-btn"
                        onClick={() => confirmDelete(item)}
                        disabled={deletingId === item._id}
                        title="Delete Food Item"
                      >
                        <FiTrash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {itemToDelete && (
        <div className="modal-backdrop" onClick={cancelDelete}>
          <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <FiAlertTriangle size={32} />
            </div>
            <h3 className="delete-modal-title">Delete Food Item</h3>
            <p className="delete-modal-desc">
              Are you sure you want to remove <strong>"{itemToDelete.name}"</strong> from your catalog?
            </p>
            <p className="delete-modal-warning">
              This action cannot be undone and will immediately remove the item from the customer menu.
            </p>

            <div className="delete-modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={cancelDelete}
                disabled={deletingId === itemToDelete._id}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="confirm-delete-btn" 
                onClick={handleExecuteDelete}
                disabled={deletingId === itemToDelete._id}
              >
                {deletingId === itemToDelete._id ? (
                  <>
                    <FiRefreshCw className="spinning" size={14} />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 size={15} />
                    <span>Confirm Delete</span>
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

export default List;
