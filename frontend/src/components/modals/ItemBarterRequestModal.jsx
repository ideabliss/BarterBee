import React, { useState } from 'react';
import { Modal, Button } from '../UI';
import { XMarkIcon, CalendarIcon, TruckIcon } from '@heroicons/react/24/outline';

const ItemBarterRequestModal = ({ isOpen, onClose, item, userItems = [], onSubmit }) => {
  const [selectedUserItem, setSelectedUserItem] = useState('');
  const [barterPeriod, setBarterPeriod] = useState(14);
  const [message, setMessage] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserItem) return;

    setLoading(true);
    try {
      await onSubmit({
        type: 'item',
        to_item_id: item.id,
        to_user_id: item.user_id,
        from_item_id: selectedUserItem,
        barter_period: barterPeriod,
        shipping_method: shippingMethod,
        message: message || `I'd like to exchange my item for your ${item.name}`
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to send request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUserItem('');
    setBarterPeriod(14);
    setMessage('');
    setShippingMethod('standard');
  };

  if (!isOpen || !item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Item Exchange Request">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Requesting Item</h3>
          <div className="flex items-center gap-3">
            <img 
              src={item.image || 'https://images.unsplash.com/photo-1586953268751-09cb3ac5c228?w=100&h=100&fit=crop'} 
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-gray-600">{item.category}</p>
              <p className="text-sm text-gray-500">Owner: {item.users?.name}</p>
            </div>
          </div>
        </div>

        {/* Select Your Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Item to Exchange
          </label>
          <select
            value={selectedUserItem}
            onChange={(e) => setSelectedUserItem(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose an item...</option>
            {userItems.filter(userItem => userItem.is_available).map(userItem => (
              <option key={userItem.id} value={userItem.id}>
                {userItem.name} ({userItem.category})
              </option>
            ))}
          </select>
          {userItems.filter(item => item.is_available).length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              You need available items to make an exchange request.
            </p>
          )}
        </div>

        {/* Barter Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            Barter Period (Days)
          </label>
          <select
            value={barterPeriod}
            onChange={(e) => setBarterPeriod(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>1 Week</option>
            <option value={14}>2 Weeks</option>
            <option value={21}>3 Weeks</option>
            <option value={30}>1 Month</option>
          </select>
        </div>

        {/* Shipping Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TruckIcon className="w-4 h-4 inline mr-1" />
            Shipping Method
          </label>
          <select
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard Post</option>
            <option value="express">Express Delivery</option>
            <option value="courier">Courier Service</option>
            <option value="pickup">Self Pickup</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!selectedUserItem || loading}
            className="flex-1"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ItemBarterRequestModal;