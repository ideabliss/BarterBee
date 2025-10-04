import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Card, Tabs, Avatar, Button, Badge, FloatingActionButton, Modal, Input, NotificationDot } from '../components/UI';
import { currentUser, mockBarterRequests } from '../data/mockData';

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'skills';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const pendingRequests = mockBarterRequests.filter(req => 
    req.to.id === currentUser.id && req.status === 'pending'
  );

  const tabs = [
    { 
      id: 'skills', 
      label: 'Skills', 
      count: currentUser.skills.length 
    },
    { 
      id: 'things', 
      label: 'Things', 
      count: currentUser.things.length 
    },
    { 
      id: 'opinions', 
      label: 'Opinions', 
      count: currentUser.opinions.length 
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const SkillCard = ({ skill, showActions = true }) => (
    <Card className="p-6 group">
      <div className="flex items-start space-x-4">
        <img
          src={skill.image}
          alt={skill.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
              <Badge variant="primary" className="mt-2">{skill.category}</Badge>
            </div>
            {showActions && (
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<PencilIcon className="h-4 w-4" />}
                  onClick={() => setEditingItem({ type: 'skill', ...skill })}
                />
                <Button
                  size="sm"
                  variant="danger"
                  icon={<TrashIcon className="h-4 w-4" />}
                  onClick={() => {
                    // TODO: Replace with actual API call to backend
                    // Example: await profileAPI.deleteSkill(skill.id);
                    console.log('Delete skill (needs backend implementation):', skill.id);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Barter requests for this skill */}
      {pendingRequests.some(req => req.toSkill?.id === skill.id) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <NotificationDot show={true} className="relative top-0 left-0" />
              <span className="text-sm font-medium text-gray-900">
                {pendingRequests.filter(req => req.toSkill?.id === skill.id).length} Barter Request(s)
              </span>
            </div>
            <Button size="sm" variant="primary">
              View Requests
            </Button>
          </div>
        </div>
      )}
    </Card>
  );

  const ThingCard = ({ thing, showActions = true }) => (
    <Card className="p-6 group">
      <div className="flex items-start space-x-4">
        <img
          src={thing.image}
          alt={thing.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{thing.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{thing.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="success" className={thing.available ? '' : 'bg-gray-100 text-gray-600'}>
                  {thing.available ? 'Available' : 'Not Available'}
                </Badge>
                <Badge variant="default">{thing.category}</Badge>
              </div>
            </div>
            {showActions && (
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<PencilIcon className="h-4 w-4" />}
                  onClick={() => setEditingItem({ type: 'thing', ...thing })}
                />
                <Button
                  size="sm"
                  variant="danger"
                  icon={<TrashIcon className="h-4 w-4" />}
                  onClick={() => {
                    // TODO: Replace with actual API call to backend
                    // Example: await profileAPI.deleteThing(thing.id);
                    console.log('Delete thing (needs backend implementation):', thing.id);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Barter requests for this thing */}
      {pendingRequests.some(req => req.toThing?.id === thing.id) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <NotificationDot show={true} className="relative top-0 left-0" />
              <span className="text-sm font-medium text-gray-900">
                {pendingRequests.filter(req => req.toThing?.id === thing.id).length} Barter Request(s)
              </span>
            </div>
            <Button size="sm" variant="primary">
              View Requests
            </Button>
          </div>
        </div>
      )}
    </Card>
  );

  const OpinionCard = ({ opinion, showActions = true }) => (
    <Card className="p-6 group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{opinion.question}</h3>
        {showActions && (
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              icon={<PencilIcon className="h-4 w-4" />}
              onClick={() => {
                // TODO: Replace with actual API call to backend
                // Example: await profileAPI.editOpinion(opinion.id);
                console.log('Edit opinion (needs backend implementation):', opinion.id);
              }}
            />
            <Button
              size="sm"
              variant="danger"
              icon={<TrashIcon className="h-4 w-4" />}
              onClick={() => {
                // TODO: Replace with actual API call to backend
                // Example: await profileAPI.deleteOpinion(opinion.id);
                console.log('Delete opinion (needs backend implementation):', opinion.id);
              }}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {opinion.type === 'text' ? (
          opinion.options.map((option, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{option}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{opinion.votes[index]}</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(opinion.votes[index] / opinion.totalVotes) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {opinion.options.map((option, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <img 
                  src={option.image} 
                  alt={option.text}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <div className="text-sm font-medium text-gray-900">{option.text}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">{opinion.votes[index]} votes</span>
                  <div className="w-12 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(opinion.votes[index] / opinion.totalVotes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{opinion.totalVotes} total votes</span>
        <Badge variant="success">Active</Badge>
      </div>
    </Card>
  );

  const AddItemModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      category: '',
      image: ''
    });

    return (
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New ${activeTab.slice(0, -1)}`}
        maxWidth="max-w-lg"
      >
        <form className="space-y-4">
          <Input
            label="Name"
            placeholder={`Enter ${activeTab.slice(0, -1)} name`}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your skill/item/question"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <Input
            label="Category"
            placeholder="e.g., Technology, Creative, Books"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          />
          
          <Input
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          />
          
          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                // TODO: Replace with actual API call to backend
                // Example: await profileAPI.addItem(activeTab, formData);
                console.log(`Add ${activeTab.slice(0, -1)} (needs backend implementation):`, formData);
                setIsAddModalOpen(false);
              }}
            >
              Add {activeTab.slice(0, -1)}
            </Button>
          </div>
        </form>
      </Modal>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <Card className="p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar src={currentUser.profilePicture} alt={currentUser.name} size="xl" />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{currentUser.name}</h1>
            <p className="text-lg text-gray-600">@{currentUser.username}</p>
            <p className="text-sm text-gray-500 mt-2">{currentUser.address}</p>
            
            <div className="flex items-center justify-center md:justify-start space-x-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentUser.skills.length}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentUser.things.length}</div>
                <div className="text-sm text-gray-600">Things</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{currentUser.points}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="self-start">
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'skills' && (
          <>
            {currentUser.skills.length > 0 ? (
              currentUser.skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Added Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by adding skills you can teach others in exchange for learning new ones.
                </p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  Add Your First Skill
                </Button>
              </Card>
            )}
          </>
        )}

        {activeTab === 'things' && (
          <>
            {currentUser.things.length > 0 ? (
              currentUser.things.map(thing => (
                <ThingCard key={thing.id} thing={thing} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Added Yet</h3>
                <p className="text-gray-600 mb-4">
                  Share items you own that others might need temporarily.
                </p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  Add Your First Item
                </Button>
              </Card>
            )}
          </>
        )}

        {activeTab === 'opinions' && (
          <>
            {currentUser.opinions.length > 0 ? (
              currentUser.opinions.map(opinion => (
                <OpinionCard key={opinion.id} opinion={opinion} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Polls Created Yet</h3>
                <p className="text-gray-600 mb-4">
                  Create polls to get help making decisions. You need at least 3 points to create your first poll.
                </p>
                {currentUser.points >= 3 ? (
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    Create Your First Poll
                  </Button>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      You have {currentUser.points} points. Answer more polls to earn points!
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = '/polls'}>
                      Answer Polls to Earn Points
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setIsAddModalOpen(true)}
        icon={<PlusIcon className="h-6 w-6" />}
      />

      {/* Add Item Modal */}
      <AddItemModal />
    </div>
  );
};

export default ProfilePage;