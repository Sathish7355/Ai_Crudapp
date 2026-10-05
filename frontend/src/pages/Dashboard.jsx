import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import ProductModal from '../components/ProductModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  Layers,
  AlertCircle,
  Tag,
  CheckCircle2,
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Software & SaaS',
  'Home & Kitchen',
  'Books & Education',
  'Clothing & Apparel',
  'Sports & Fitness',
  'Health & Beauty',
  'General'
];

const Dashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyMine, setOnlyMine] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notification / Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (onlyMine) {
        params.mine = 'true';
      }

      const res = await productService.getProducts(params);
      if (res.data && res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      const msg = err.response?.data?.message || 'Failed to load products from database.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory, onlyMine]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = products.length;
    const totalVal = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
    const inStockCount = products.filter((p) => (p.stock || 0) > 0).length;
    const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;
    return {
      totalCount,
      totalVal,
      inStockCount,
      outOfStockCount
    };
  }, [products]);

  // Create or Update handler
  const handleSaveProduct = async (productData) => {
    setModalLoading(true);
    try {
      if (editingProduct) {
        // Update
        const res = await productService.updateProduct(editingProduct.id, productData);
        if (res.data && res.data.success) {
          showToast(`Product "${productData.name}" updated successfully!`);
          setModalOpen(false);
          setEditingProduct(null);
          fetchProducts();
        }
      } else {
        // Create
        const res = await productService.createProduct(productData);
        if (res.data && res.data.success) {
          showToast(`Product "${productData.name}" created successfully!`);
          setModalOpen(false);
          fetchProducts();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving product.';
      showToast(msg, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete handler
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      const res = await productService.deleteProduct(deletingProduct.id);
      if (res.data && res.data.success) {
        showToast(`Product "${deletingProduct.name}" removed successfully.`);
        setDeleteDialogOpen(false);
        setDeletingProduct(null);
        fetchProducts();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting product.';
      showToast(msg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition animate-in slide-in-from-bottom-5 ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Database Notice if connection error */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold block mb-1">Database Connection Notice</span>
              <p className="mb-2">{error}</p>
              <p className="text-xs text-amber-800">
                Tip: Open <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">backend/.env</code>,
                ensure your MySQL root password is set in <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">DB_PASSWORD</code>,
                and restart the backend. The database <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">ai_crudapp_db</code> will be created automatically.
              </p>
            </div>
            <button
              onClick={fetchProducts}
              className="ml-auto px-3 py-1.5 text-xs font-semibold bg-amber-200 hover:bg-amber-300 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Product Inventory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage items, track stock levels, and organize your catalog in real-time.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Products */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
            </div>
          </div>

          {/* Total Inventory Value */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* In Stock */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In-Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inStockCount}</p>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStockCount}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2 pr-8 text-sm rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition cursor-pointer appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchProducts}
                className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 transition"
                title="Refresh product list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick filter checkboxes */}
          <div className="flex items-center space-x-4 pt-2 border-t border-gray-50 text-xs text-gray-600">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(e) => setOnlyMine(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Show only products created by me</span>
            </label>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-500">Loading inventory data...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No products found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
              {searchTerm || selectedCategory !== 'All' || onlyMine
                ? 'No items matched your current filter criteria. Try changing your search keywords or resetting filters.'
                : 'Get started by creating your first product item in the inventory.'}
            </p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Stock</th>
                    <th className="px-6 py-3.5">Created By</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-sm">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.stock > 10
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.stock > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {item.user_name || 'System'}
                        {item.is_owner && (
                          <span className="ml-1.5 text-indigo-600 font-medium">(You)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {item.is_owner ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingProduct(item);
                                  setModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingProduct(item);
                                  setDeleteDialogOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Read-only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        item.stock > 10
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.stock > 0
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-1.5">{item.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Price</span>
                    <span className="text-lg font-extrabold text-gray-900">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.is_owner ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingProduct(item);
                            setModalOpen(true);
                          }}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingProduct(item);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">By {item.user_name}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Modal (Create / Edit) */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        product={editingProduct}
        loading={modalLoading}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deletingProduct?.name}"?`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Dashboard;
