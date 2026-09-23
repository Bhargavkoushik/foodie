import React, { useState } from 'react';
import './Add.css';
import apiRequest from '../../../lib/apiRequest';
import { toast } from 'react-toastify';
import { 
  FiUploadCloud, 
  FiRefreshCw, 
  FiCheck, 
  FiX, 
  FiPlus, 
  FiArrowLeft 
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const Add = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: '',
    description: '',
    category: 'Salad',
    price: ''
  });

  const categories = [
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

  const validateAndSetImage = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported file format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetImage(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setData({
      name: '',
      description: '',
      category: 'Salad',
      price: ''
    });
    removeImage();
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.warning('Please select a food item image before submitting.');
      return;
    }

    if (!data.name.trim()) {
      toast.warning('Please enter a valid food name.');
      return;
    }

    if (!data.price || Number(data.price) <= 0) {
      toast.warning('Please enter a valid price greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('image', image);
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('category', data.category);
      formData.append('price', Number(data.price));

      const response = await apiRequest.post('/api/food/add', formData);

      if (response.data.success) {
        toast.success(response.data.message || 'Food item added to catalog successfully!');
        handleReset();
      } else {
        toast.error(response.data.message || 'Error adding food item.');
      }
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error(error.response?.data?.message || 'Failed to add food. Please verify permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-food-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiPlus size={24} className="text-primary" />
            Add New Food Item
          </h1>
          <p className="page-subtitle">
            Upload a high quality photo, define pricing, and publish directly to the customer menu.
          </p>
        </div>
        <Link to="/admin/foods" className="btn-secondary">
          <FiArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="add-form-card">
        <form onSubmit={onSubmitHandler} className="add-food-form">
          <div className="form-layout-two-col">
            {/* Left Column: Image Upload Area */}
            <div className="upload-col">
              <label className="form-section-label">Food Image</label>
              <p className="form-section-helper">
                High resolution appetizing photo of the dish (JPG, PNG, WEBP up to 5MB)
              </p>

              <div 
                className={`image-dropzone ${isDragging ? 'dragging' : ''} ${imagePreview ? 'has-preview' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="preview-container">
                    <img 
                      src={imagePreview} 
                      alt="Food preview" 
                      className="preview-img" 
                    />
                    <div className="preview-overlay">
                      <label htmlFor="food-image-input" className="change-img-btn">
                        <FiRefreshCw size={14} />
                        <span>Change Image</span>
                      </label>
                      <button 
                        type="button" 
                        className="remove-img-btn" 
                        onClick={removeImage}
                        title="Remove image"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                    <div className="preview-badge">
                      <FiCheck size={12} />
                      <span>{image.name}</span>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="food-image-input" className="dropzone-label">
                    <div className="upload-icon-circle">
                      <FiUploadCloud size={32} />
                    </div>
                    <div className="dropzone-text">
                      <span className="dropzone-main-text">Click to upload food image</span>
                      <span className="dropzone-sub-text">or drag and drop file here</span>
                    </div>
                    <div className="format-pills">
                      <span>PNG</span>
                      <span>JPG</span>
                      <span>WEBP</span>
                    </div>
                  </label>
                )}

                <input
                  id="food-image-input"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  hidden
                />
              </div>

              {imagePreview && (
                <p className="image-help-text">
                  ✓ Photo selected. Looks appetizing!
                </p>
              )}
            </div>

            {/* Right Column: Dish Information */}
            <div className="info-col">
              <label className="form-section-label">Dish Information</label>
              <p className="form-section-helper">
                Provide clear dish name, category, and ingredient details for customers
              </p>

              <div className="form-field-group">
                <label className="field-label" htmlFor="food-name">
                  Food Name <span className="required-star">*</span>
                </label>
                <input
                  id="food-name"
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={onChangeHandler}
                  placeholder="e.g. Artisanal Margherita Pizza"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row-two-col">
                <div className="form-field-group">
                  <label className="field-label" htmlFor="food-category">
                    Category <span className="required-star">*</span>
                  </label>
                  <select
                    id="food-category"
                    name="category"
                    value={data.category}
                    onChange={onChangeHandler}
                    className="form-select"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="field-label" htmlFor="food-price">
                    Price (₹) <span className="required-star">*</span>
                  </label>
                  <div className="price-input-wrap">
                    <span className="currency-prefix">₹</span>
                    <input
                      id="food-price"
                      type="number"
                      step="0.01"
                      min="1"
                      name="price"
                      value={data.price}
                      onChange={onChangeHandler}
                      placeholder="199"
                      className="form-input price-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label" htmlFor="food-desc">
                  Description <span className="required-star">*</span>
                </label>
                <textarea
                  id="food-desc"
                  name="description"
                  value={data.description}
                  onChange={onChangeHandler}
                  rows="4"
                  placeholder="Describe taste, ingredients, crust, preparation, or dietary highlights..."
                  className="form-textarea"
                  required
                />
                <span className="character-hint">
                  {data.description.length} characters
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="form-actions-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              disabled={submitting}
            >
              Reset Form
            </button>

            <button
              type="submit"
              className="btn-primary submit-food-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FiRefreshCw className="spinning" size={16} />
                  <span>Uploading to Menu...</span>
                </>
              ) : (
                <>
                  <FiPlus size={16} />
                  <span>Add Food Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
