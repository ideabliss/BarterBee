import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../UI';
import apiService from '../../services/api';

const EditItemModal = ({ isOpen, onClose, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    condition_rating: 5,
    is_available: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        image: item.image || '',
        condition_rating: item.condition_rating || 5,
        is_available: item.is_available !== undefined ? item.is_available : true
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.updateItem(item.id, formData);
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Item"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Input
          label="Item Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          required
        />

        <Input
          label="Image URL"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition Rating
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.condition_rating}
            onChange={(e) => setFormData(prev => ({ ...prev, condition_rating: parseInt(e.target.value) }))}
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Fair</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Very Poor</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_available"
            checked={formData.is_available}
            onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
            Available for borrowing
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
          >
            Update Item
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditItemModal;