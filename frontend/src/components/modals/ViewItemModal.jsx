import React from 'react';
import { Modal, Badge, Button } from '../UI';

const ViewItemModal = ({ isOpen, onClose, item, onEdit, onDelete }) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Item Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <img
            src={item.image || 'https://images.unsplash.com/photo-1586953268751-09cb3ac5c228?w=300&h=200&fit=crop'}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={item.is_available ? "success" : "secondary"}>
                {item.is_available ? "Available" : "Not Available"}
              </Badge>
              <Badge variant="outline">{item.category}</Badge>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600">{item.description}</p>
        </div>

        {item.condition_rating && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Condition Rating</h4>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= item.condition_rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">({item.condition_rating}/5)</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                onDelete(item.id);
                onClose();
              }
            }}
          >
            Delete
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              onEdit(item);
              onClose();
            }}
          >
            Edit Item
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewItemModal;