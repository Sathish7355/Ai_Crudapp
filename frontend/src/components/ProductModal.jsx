import React, { useState, useEffect } from 'react';
import { X, Package, Tag, DollarSign, Layers, AlignLeft } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Software & SaaS',
  'Home & Kitchen',
  'Books & Education',
  'Clothing & Apparel',
  'Sports & Fitness',
  'Health & Beauty',
  'General'
];

const ProductModal = ({ isOpen, onClose, onSubmit, product = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'General',
    stock: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price !== undefined ? product.price : '',
        category: product.category || 'General',
        stock: product.stock !== undefined ? product.stock : 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'General',
        stock: '1'
      });
    }
    setErrors({});
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Please provide a valid price (>= 0)';
    }
    if (formData.stock !== '' && (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
      newErrors.stock = 'Stock must be a positive integer or 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      stock: formData.stock === '' ? 0 : parseInt(formData.stock, 10)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.name ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-indigo-500'
                } text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Category and Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Tag className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Price ($) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border ${
                    errors.price ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-indigo-500'
                  } text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition`}
                />
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
              </div>
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Stock Quantity
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.stock ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-indigo-500'
                } text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition`}
              />
              <Layers className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Detailed description of features, specifications, and warranty..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition resize-none"
            ></textarea>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="spinner-sm"></div>}
              <span>{product ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
