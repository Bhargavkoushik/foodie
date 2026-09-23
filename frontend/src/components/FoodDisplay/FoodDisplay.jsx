import React, { useContext, useState } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category = 'All', setCategory, searchQuery = '', setSearchQuery }) => {
  const { food_list, sortOrder, setSortOrder } = useContext(StoreContext);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'veg' | 'non-veg'

  const handleToggle = (type) => {
    setFilterType(type);
  };

  const isVegItem = (item) => {
    if (item.type === 'veg') return true;
    if (item.type === 'nonveg' || item.type === 'non-veg') return false;
    if (item.category === 'Pure Veg') return true;
    const text = `${item.name || ''} ${item.description || ''} ${item.category || ''}`.toLowerCase();
    const nonVegWords = ['chicken', 'beef', 'pork', 'fish', 'prawn', 'meat', 'mutton', 'egg', 'seafood'];
    return !nonVegWords.some((w) => text.includes(w));
  };

  const query = (searchQuery || '').trim().toLowerCase();

  const filteredFoodList = (food_list || []).filter((item) => {
    const matchCategory = category === 'All' || item.category?.toLowerCase() === category.toLowerCase();
    const matchType =
      filterType === 'all' ||
      (filterType === 'veg' && isVegItem(item)) ||
      (filterType === 'non-veg' && !isVegItem(item));
    const matchSearch =
      !query ||
      item.name?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query);

    return matchCategory && matchType && matchSearch;
  });

  // Apply sorting by price
  const sortedFoodList = [...filteredFoodList];
  if (sortOrder === 'asc') {
    sortedFoodList.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'desc') {
    sortedFoodList.sort((a, b) => b.price - a.price);
  }

  const handleResetFilters = () => {
    setFilterType('all');
    if (setSearchQuery) setSearchQuery('');
    if (setCategory) setCategory('All');
    if (setSortOrder) setSortOrder('none');
  };

  return (
    <div className="food-display" id="food-display">
      <div className="food-display-header">
        <h4 className="top-dishes-heading">
          {category === 'All' ? 'Top Dishes Near You' : `${category} Specialties`}
        </h4>
        <p className="food-display-subtitle">Explore handcrafted meals prepared with fresh ingredients</p>
      </div>

      {/* Active Search Pill Banner */}
      {query && (
        <div className="active-search-banner">
          <span>
            Results for: <strong>"{searchQuery}"</strong> ({sortedFoodList.length} items found)
          </span>
          <button
            className="clear-search-pill-btn"
            onClick={() => setSearchQuery && setSearchQuery('')}
            title="Clear search"
          >
            Clear Search ✕
          </button>
        </div>
      )}

      {/* Controls: Veg/Non-Veg + Count + Price Sort */}
      <div className="food-display-controls">
        <div className="filter-toggle">
          <button
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => handleToggle('all')}
          >
            All
          </button>
          <button
            className={`veg-btn ${filterType === 'veg' ? 'active' : ''}`}
            onClick={() => handleToggle('veg')}
          >
            🌱 Veg
          </button>
          <button
            className={`non-veg-btn ${filterType === 'non-veg' ? 'active' : ''}`}
            onClick={() => handleToggle('non-veg')}
          >
            🍖 Non-Veg
          </button>
        </div>

        <div className="controls-right">
          <span className="items-count-badge">{sortedFoodList.length} dishes</span>
          <div className="sort-control">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="none">Featured</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Food Grid or Empty State */}
      {sortedFoodList.length === 0 ? (
        <div className="food-empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h3>No dishes found</h3>
          <p>
            {query
              ? `No dishes matching "${searchQuery}" in this category.`
              : 'No dishes found matching your current filter criteria.'}
          </p>
          <button className="reset-filters-btn" onClick={handleResetFilters}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="food-display-list">
          {sortedFoodList.map((item, index) => (
            <FoodItem
              key={item._id || index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
