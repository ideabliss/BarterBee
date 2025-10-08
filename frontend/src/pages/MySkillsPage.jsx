import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Modal } from '../components/UI';
import { currentUser, mockBarterRequests } from '../data/mockData';
import { PlusIcon, EyeIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MySkillsPage = () => {
  const [activeTab, setActiveTab] = useState('skills');
  const [showAddModal, setShowAddModal] = useState(false);

  const skillRequests = mockBarterRequests.filter(req => 
    req.type === 'skill' && (req.from.id === currentUser.id || req.to.id === currentUser.id)
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Skills</h1>
        <p className="text-gray-600 mt-2">Manage your skills and track skill exchange requests</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'skills'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Skills ({currentUser.skills.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Requests ({skillRequests.length})
          </button>
        </nav>
      </div>

      {activeTab === 'skills' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Your Skills</h2>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <PlusIcon className="w-4 h-4" />
              Add Skill
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentUser.skills.map((skill) => (
              <Card key={skill.id} className="overflow-hidden">
                <img src={skill.image} alt={skill.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{skill.name}</h3>
                    <Badge variant="secondary">{skill.category}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{skill.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Skill Exchange Requests</h2>
          <div className="space-y-4">
            {skillRequests.map((request) => (
              <Card key={request.id} className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={request.from.profilePicture} 
                        alt={request.from.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{request.from.name}</h3>
                        <p className="text-sm text-gray-600">
                          Wants to exchange {request.fromSkill.name} for {request.toSkill.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{request.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-3">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                    {request.status === 'pending' && (
                      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Button size="sm" variant="outline" className="w-full md:w-auto">Decline</Button>
                        <Button size="sm" className="w-full md:w-auto">Accept</Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Skill</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Culinary</option>
                  <option>Music</option>
                  <option>Technology</option>
                  <option>Creative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowAddModal(false)} className="flex-1">
                  Add Skill
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MySkillsPage;