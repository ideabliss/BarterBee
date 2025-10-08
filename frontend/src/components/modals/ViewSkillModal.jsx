import React from 'react';
import { Modal, Badge, Button } from '../UI';

const ViewSkillModal = ({ isOpen, onClose, skill, onEdit }) => {
  if (!skill) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Skill Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <img
            src={skill.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop'}
            alt={skill.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{skill.name}</h3>
            <Badge variant="primary" className="mt-2">{skill.category}</Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600">{skill.description}</p>
        </div>

        {skill.skill_level && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Skill Level</h4>
            <p className="text-gray-600 capitalize">{skill.skill_level}</p>
          </div>
        )}

        {skill.years_experience && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Years of Experience</h4>
            <p className="text-gray-600">{skill.years_experience} years</p>
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
            variant="primary"
            className="flex-1"
            onClick={() => {
              onEdit(skill);
              onClose();
            }}
          >
            Edit Skill
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSkillModal;