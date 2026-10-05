import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title || 'Confirm Deletion'}</h3>
            <p className="text-xs text-gray-500">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {message || 'Are you sure you want to delete this item?'}
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
          >
            {loading ? (
              <div className="spinner-sm"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
