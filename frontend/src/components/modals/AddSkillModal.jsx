import React, { useState } from 'react';
import { Modal, Button, Input } from '../UI';

const AddSkillModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    skill_level: 'intermediate',
    years_experience: 1
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        description: '',
        category: '',
        image: '',
        skill_level: 'intermediate',
        years_experience: 1
      });
      onClose();
    } catch (error) {
      console.error('Failed to add skill:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Skill" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Skill Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Guitar Playing, Web Development"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            <option value="Technology">Technology</option>
            <option value="Music">Music</option>
            <option value="Culinary">Culinary</option>
            <option value="Creative">Creative</option>
            <option value="Sports">Sports</option>
            <option value="Language">Language</option>
            <option value="Academic">Academic</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your skill and what you can teach..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
          <select
            name="skill_level"
            value={formData.skill_level}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
          <input
            type="number"
            name="years_experience"
            value={formData.years_experience}
            onChange={handleChange}
            min="0"
            max="50"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Input
          label="Image URL (Optional)"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />

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
            Add Skill
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSkillModal;