import React, { useState, useEffect } from 'react';
import { Modal, Button } from './UI';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const BarterRequestModal = ({ isOpen, onClose, selectedSkill, onSubmit }) => {
  const [selectedMySkill, setSelectedMySkill] = useState('');
  const [message, setMessage] = useState('');

  const [numberOfSessions, setNumberOfSessions] = useState(1);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadUserSkills();
    }
  }, [isOpen]);

  const loadUserSkills = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserSkills();
      setUserSkills(response.skills || []);
    } catch (error) {
      console.error('Failed to load user skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedSkillObj = userSkills.find(skill => skill.id === parseInt(selectedMySkill));
      await onSubmit({
        from_skill_id: selectedMySkill,
        message,

        number_of_sessions: numberOfSessions
      });
      setSelectedMySkill('');
      setMessage('');

      setNumberOfSessions(1);
    } catch (error) {
      console.error('Failed to submit barter request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request ${selectedSkill?.name} Session`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <img
              src={selectedSkill?.image}
              alt={selectedSkill?.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div>
              <div className="font-medium text-gray-900">{selectedSkill?.name}</div>
              <div className="text-sm text-gray-600">with {selectedSkill?.user.name}</div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Skill to Exchange
          </label>
          <select
            value={selectedMySkill}
            onChange={(e) => setSelectedMySkill(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          >
            <option value="">{loading ? 'Loading skills...' : 'Select a skill to offer'}</option>
            {userSkills.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name} - {skill.category}
              </option>
            ))}
            {!loading && userSkills.length === 0 && (
              <option value="" disabled>No skills available - Add skills first</option>
            )}
          </select>
        </div>



        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Sessions
          </label>
          <select
            value={numberOfSessions}
            onChange={(e) => setNumberOfSessions(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 Session</option>
            <option value={2}>2 Sessions</option>
            <option value={3}>3 Sessions</option>
            <option value={4}>4 Sessions</option>
            <option value={5}>5 Sessions</option>
            <option value={10}>10 Sessions</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell them why you'd like to learn this skill..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={loading || !selectedMySkill}>
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BarterRequestModal;