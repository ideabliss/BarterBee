import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../UI';
import apiService from '../../services/api';

const EditSkillModal = ({ isOpen, onClose, skill, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    skill_level: 'beginner',
    years_experience: 1
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || '',
        description: skill.description || '',
        category: skill.category || '',
        image: skill.image || '',
        skill_level: skill.skill_level || 'beginner',
        years_experience: skill.years_experience || 1
      });
    }
  }, [skill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.updateSkill(skill.id, formData);
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
      title="Edit Skill"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Input
          label="Skill Name"
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
            Skill Level
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.skill_level}
            onChange={(e) => setFormData(prev => ({ ...prev, skill_level: e.target.value }))}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <Input
          label="Years of Experience"
          type="number"
          min="1"
          max="50"
          value={formData.years_experience}
          onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) }))}
          required
        />

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
            Update Skill
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSkillModal;