import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Card, Tabs, Avatar, Button, Badge, FloatingActionButton, Modal, Input, NotificationDot } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/modals/EditProfileModal';
import AddSkillModal from '../components/modals/AddSkillModal';
import AddItemModal from '../components/modals/AddItemModal';
import CreatePollModal from '../components/modals/CreatePollModal';
import apiService from '../services/api';

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'skills';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [skills, setSkills] = useState([]);
  const [items, setItems] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const pendingRequests = [];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [skillsRes, itemsRes, pollsRes] = await Promise.all([
        apiService.getUserSkills(),
        apiService.getUserItems(),
        apiService.getUserPolls()
      ]);
      setSkills(skillsRes.skills || []);
      setItems(itemsRes.items || []);
      setPolls(pollsRes.polls || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'skills', 
      label: 'Skills', 
      count: skills.length 
    },
    { 
      id: 'things', 
      label: 'Things', 
      count: items.length 
    },
    { 
      id: 'opinions', 
      label: 'Opinions', 
      count: polls.length 
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
                  onClick={async () => {
                    try {
                      await apiService.deleteSkill(skill.id);
                      loadUserData();
                    } catch (error) {
                      console.error('Failed to delete skill:', error);
                    }
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
                <Badge variant="success" className={thing.is_available ? '' : 'bg-gray-100 text-gray-600'}>
                  {thing.is_available ? 'Available' : 'Not Available'}
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
                  onClick={async () => {
                    try {
                      await apiService.deleteItem(thing.id);
                      loadUserData();
                    } catch (error) {
                      console.error('Failed to delete item:', error);
                    }
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

  const OpinionCard = ({ opinion, showActions = true }) => {
    const options = Array.isArray(opinion.options) ? opinion.options : JSON.parse(opinion.options || '[]');
    const votes = Array.isArray(opinion.votes) ? opinion.votes : JSON.parse(opinion.votes || '[]');
    const totalVotes = votes.reduce((sum, count) => sum + count, 0);
    
    return (
      <Card className="p-6 group">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{opinion.question}</h3>
          {showActions && (
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="danger"
                icon={<TrashIcon className="h-4 w-4" />}
                onClick={async () => {
                  try {
                    // TODO: Add delete poll API endpoint
                    console.log('Delete poll:', opinion.id);
                  } catch (error) {
                    console.error('Failed to delete poll:', error);
                  }
                }}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {opinion.poll_type === 'text' ? (
            options.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{option}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{votes[index] || 0}</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: totalVotes > 0 ? `${((votes[index] || 0) / totalVotes) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {options.map((option, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <img 
                    src={option.image} 
                    alt={option.text}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <div className="text-sm font-medium text-gray-900">{option.text}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">{votes[index] || 0} votes</span>
                    <div className="w-12 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: totalVotes > 0 ? `${((votes[index] || 0) / totalVotes) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{totalVotes} total votes</span>
          <Badge variant="success">Active</Badge>
        </div>
      </Card>
    );
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <Card className="p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar src={user?.profile_picture} alt={user?.name} size="xl" />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-lg text-gray-600">@{user?.username}</p>
            <p className="text-sm text-gray-500 mt-2">{user?.address}</p>
            
            <div className="flex items-center justify-center md:justify-start space-x-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{items.length}</div>
                <div className="text-sm text-gray-600">Things</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{user?.points || 0}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="self-start"
            onClick={() => setIsEditProfileOpen(true)}
          >
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
        {loading ? (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading...</p>
          </Card>
        ) : (
          <>
            {activeTab === 'skills' && (
              skills.length > 0 ? (
                <div className="grid gap-6">
                  {skills.map(skill => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
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
              )
            )}

            {activeTab === 'things' && (
              items.length > 0 ? (
                <div className="grid gap-6">
                  {items.map(item => (
                    <ThingCard key={item.id} thing={item} />
                  ))}
                </div>
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
              )
            )}

            {activeTab === 'opinions' && (
              polls.length > 0 ? (
                <div className="grid gap-6">
                  {polls.map(poll => (
                    <OpinionCard key={poll.id} opinion={poll} />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">🤔</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Polls Created Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create polls to get help making decisions. You need at least 3 points to create your first poll.
                  </p>
                  {(user?.points || 0) >= 3 ? (
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      Create Your First Poll
                    </Button>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        You have {user?.points || 0} points. Answer more polls to earn points!
                      </p>
                      <Button variant="outline" onClick={() => window.location.href = '/polls'}>
                        Answer Polls to Earn Points
                      </Button>
                    </div>
                  )}
                </Card>
              )
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setIsAddModalOpen(true)}
        icon={<PlusIcon className="h-6 w-6" />}
      />

      {/* Add Modals */}
      {activeTab === 'skills' && (
        <AddSkillModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadUserData}
        />
      )}
      
      {activeTab === 'things' && (
        <AddItemModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadUserData}
        />
      )}
      
      {activeTab === 'opinions' && (
        <CreatePollModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadUserData}
        />
      )}
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;