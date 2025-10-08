import React, { useState } from 'react';
import { Modal, Button, Input } from '../UI';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CreatePollModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    question: '',
    type: 'text',
    options: ['', '']
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validOptions = formData.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        options: validOptions
      });
      setFormData({
        question: '',
        type: 'text',
        options: ['', '']
      });
      onClose();
    } catch (error) {
      console.error('Failed to create poll:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Poll (3 points)" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poll Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="type"
                value="text" 
                checked={formData.type === 'text'}
                onChange={handleChange}
                className="mr-2"
              />
              Text Options
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="type"
                value="image" 
                checked={formData.type === 'image'}
                onChange={handleChange}
                className="mr-2"
              />
              Image Options
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <textarea 
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What would you like to ask the community?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" 
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {formData.options.length < 6 && (
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={addOption}
                className="flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Option
              </Button>
            )}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
          >
            Create Poll (-3 points)
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePollModal;