import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { PlusIcon, EyeIcon, ClockIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SkillCard from '../components/SkillCard';
import BarterRequestModal from '../components/BarterRequestModal';
import AddSkillModal from '../components/modals/AddSkillModal';
import ViewSkillModal from '../components/modals/ViewSkillModal';
import EditSkillModal from '../components/modals/EditSkillModal';
import ScheduleSessionModal from '../components/modals/ScheduleSessionModal';
import RescheduleModal from '../components/modals/RescheduleModal';
import AcceptDeclineModal from '../components/modals/AcceptDeclineModal';
import SessionRequestModal from '../components/modals/SessionRequestModal';
import SessionViewModal from '../components/modals/SessionViewModal';
import SessionHistoryModal from '../components/modals/SessionHistoryModal';
import ChatModal from '../components/modals/ChatModal';
import ReviewModal from '../components/modals/ReviewModal';
import ProfileModal from '../components/modals/ProfileModal';

const SkillBarterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [barterModalOpen, setBarterModalOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showAcceptDeclineModal, setShowAcceptDeclineModal] = useState(false);
  const [showSessionRequestModal, setShowSessionRequestModal] = useState(false);
  const [showSessionViewModal, setShowSessionViewModal] = useState(false);
  const [showSessionHistoryModal, setShowSessionHistoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [selectedSkillForView, setSelectedSkillForView] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [skillRequests, setSkillRequests] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadSkills();
    loadUserSkills();
    loadRequests();
    loadActivities();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSkills();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSkills({ search: searchTerm });
      setAllSkills(response.skills || []);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSkills = async () => {
    try {
      const response = await apiService.getUserSkills();
      setUserSkills(response.skills || []);
    } catch (error) {
      console.error('Failed to load user skills:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await apiService.getBarterRequests();
      setSkillRequests(response.requests?.filter(req => req.type === 'skill') || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await apiService.getActivity();
      setActivities(response.activities?.filter(act => act.type === 'skill') || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const filteredSkills = allSkills.filter(skill => 
    skill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBarterRequest = (skill) => {
    setSelectedSkill(skill);
    setBarterModalOpen(true);
  };

  const handleBarterSubmit = async (requestData) => {
    try {
      await apiService.createBarterRequest({
        ...requestData,
        type: 'skill',
        to_skill_id: selectedSkill.id,
        to_user_id: selectedSkill.user_id
      });
      setBarterModalOpen(false);
      loadRequests();
    } catch (error) {
      console.error('Failed to create barter request:', error);
    }
  };

  const handleAddSkill = async (skillData) => {
    try {
      await apiService.createSkill(skillData);
      setShowAddModal(false);
      loadUserSkills();
    } catch (error) {
      console.error('Failed to add skill:', error);
    }
  };

  const handleAcceptRequest = async (requestId, message) => {
    try {
      await apiService.updateBarterStatus(requestId, 'accepted');
      if (message) {
        await apiService.sendMessage({
          barter_request_id: requestId,
          message
        });
      }
      loadRequests();
      loadActivities();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDeclineRequest = async (requestId, message) => {
    try {
      await apiService.updateBarterStatus(requestId, 'declined');
      if (message) {
        await apiService.sendMessage({
          barter_request_id: requestId,
          message
        });
      }
      loadRequests();
      loadActivities();
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Skill Barter</h1>
        <p className="text-gray-600 mt-2">Find skills to learn, manage your skills, and track exchanges</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Find Skills
          </button>
          <button
            onClick={() => setActiveTab('my-skills')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-skills'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Skills ({userSkills.length})
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
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Activity
          </button>
        </nav>
      </div>

      {/* Find Skills Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading skills...</div>
            ) : filteredSkills.length > 0 ? (
              filteredSkills.map(skill => (
                <SkillCard 
                  key={`${skill.users?.id || skill.user_id}-${skill.id}`} 
                  skill={{
                    ...skill,
                    user: skill.users || { id: skill.user_id, name: 'Unknown User' },
                    rating: skill.average_rating || 4.5,
                    sessions: skill.total_sessions || 0,
                    responseTime: skill.response_time || 24
                  }} 
                  onBarterRequest={handleBarterRequest}
                  onViewProfile={(userProfile) => {
                    setSelectedUserProfile(userProfile);
                    setShowProfileModal(true);
                  }}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Found</h3>
                <p className="text-gray-600">Try adjusting your search terms or browse all available skills.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Skills Tab */}
      {activeTab === 'my-skills' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Your Skills</h2>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <PlusIcon className="w-4 h-4" />
              Add Skill
            </Button>
          </div>
          
          {userSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSkills.map((skill) => (
                <Card key={skill.id} className="overflow-hidden">
                  <img src={skill.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop'} alt={skill.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{skill.name}</h3>
                      <Badge variant="secondary">{skill.category}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{skill.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedSkillForView(skill);
                          setShowViewModal(true);
                        }}
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedSkillForView(skill);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Added Yet</h3>
              <p className="text-gray-600 mb-4">Start by adding skills you can teach others in exchange for learning new ones.</p>
              <Button onClick={() => setShowAddModal(true)}>Add Your First Skill</Button>
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Skill Exchange Requests</h2>
          {skillRequests.length > 0 ? (
            <div className="space-y-4">
              {skillRequests.map((request) => (
                <Card key={request.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={request.from_user?.profile_picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'} 
                          alt={request.from_user?.name || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{request.from_user?.name || 'Unknown User'}</h3>
                          <p className="text-sm text-gray-600">
                            Skill exchange request
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{request.message || 'No message provided'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      {request.status === 'pending' && (
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                          <Button 
                            size="sm" 
                            className="w-full md:w-auto"
                            onClick={() => {
                              setSelectedActivity({
                                requestId: request.id,
                                partnerName: request.from_user?.name || 'Unknown User',
                                partnerAvatar: request.from_user?.profile_picture,
                                requestMessage: request.message,
                                preferredDate: request.preferred_date || 'Not specified',
                                preferredTime: request.preferred_time || 'Not specified',
                                duration: '60 minutes'
                              });
                              setShowAcceptDeclineModal(true);
                            }}
                          >
                            Respond
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Yet</h3>
              <p className="text-gray-600">Skill exchange requests will appear here when others want to learn from you.</p>
            </div>
          )}
        </div>
      )}

      {/* My Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Skill Activity</h2>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {activity.type === 'skill' ? 'Skill Exchange' : 'Activity'}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {activity.message || `Activity with ${activity.from_user?.name || activity.to_user?.name}`}
                      </p>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                      
                      {activity.status === 'accepted' && (
                        <Button 
                          size="sm" 
                          className="w-full md:w-auto"
                          onClick={() => {
                            setSelectedActivity({ 
                              requestId: activity.id,
                              partnerName: activity.from_user?.name || activity.to_user?.name,
                              numberOfSessions: activity.number_of_sessions || 1
                            });
                            setShowScheduleModal(true);
                          }}
                        >
                          Schedule Session
                        </Button>
                      )}
                      
                      {(activity.status === 'scheduled' || activity.status === 'completed') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full md:w-auto"
                          onClick={async () => {
                            try {
                              const response = await apiService.getSessionHistory(activity.id);
                              setSelectedActivity({ 
                                ...activity,
                                sessionHistory: response.sessions,
                                completedSessions: response.completedSessions,
                                totalSessions: response.totalSessions,
                                canScheduleNext: response.canScheduleNext
                              });
                              setShowSessionHistoryModal(true);
                            } catch (error) {
                              console.error('Failed to load session history:', error);
                            }
                          }}
                        >
                          View Sessions ({activity.sessions?.filter(s => s.status === 'completed').length || 0}/{activity.number_of_sessions || 1})
                        </Button>
                      )}
                      
                      {activity.status === 'scheduled' && activity.sessions?.some(s => s.status === 'scheduled') && (
                        <>
                          {(() => {
                            const nextSession = activity.sessions?.find(s => s.status === 'scheduled');
                            if (!nextSession) return null;
                            
                            const sessionDateTime = new Date(`${nextSession.scheduled_date}T${nextSession.scheduled_time}`);
                            const now = new Date();
                            const timeDiff = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60);
                            const canJoin = timeDiff <= 15 && timeDiff >= -60;
                            
                            return (
                              <Button 
                                size="sm" 
                                variant={canJoin ? "primary" : "outline"}
                                className="w-full md:w-auto"
                                disabled={!canJoin}
                                onClick={() => {
                                  if (canJoin) {
                                    navigate(`/session/${nextSession.id}`);
                                  }
                                }}
                              >
                                {canJoin ? 'Join Now' : `Next Session: ${new Date(sessionDateTime).toLocaleDateString()}`}
                              </Button>
                            );
                          })()} 
                        </>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full md:w-auto"
                        onClick={() => {
                          setSelectedActivity({ 
                            requestId: activity.id,
                            partnerName: activity.from_user?.name || activity.to_user?.name,
                            partnerId: activity.from_user_id === user?.id ? activity.to_user_id : activity.from_user_id
                          });
                          setShowChatModal(true);
                        }}
                      >
                        Chat
                      </Button>
                      
                      {activity.status === 'completed' && activity.sessions?.some(s => s.status === 'completed') && activity.sessions?.filter(s => s.status === 'completed').length < (activity.number_of_sessions || 1) && (
                        <Button 
                          size="sm" 
                          className="w-full md:w-auto"
                          onClick={() => {
                            setSelectedActivity({ 
                              requestId: activity.id,
                              partnerName: activity.from_user?.name || activity.to_user?.name,
                              numberOfSessions: activity.number_of_sessions || 1,
                              completedSessions: activity.sessions?.filter(s => s.status === 'completed').length || 0
                            });
                            setShowScheduleModal(true);
                          }}
                        >
                          Schedule Next Session
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-600">Your skill exchange activities will appear here once you start bartering.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <BarterRequestModal
        isOpen={barterModalOpen}
        onClose={() => setBarterModalOpen(false)}
        selectedSkill={selectedSkill}
        onSubmit={handleBarterSubmit}
      />

      <AddSkillModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSkill}
      />

      <ScheduleSessionModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        activity={selectedActivity}
        onScheduled={() => {
          loadActivities();
          loadRequests();
        }}
      />

      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        activity={selectedActivity}
      />

      <AcceptDeclineModal
        isOpen={showAcceptDeclineModal}
        onClose={() => setShowAcceptDeclineModal(false)}
        activity={selectedActivity}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
      />

      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        activity={selectedActivity}
      />

      <ViewSkillModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        skill={selectedSkillForView}
        onEdit={(skill) => {
          setSelectedSkillForView(skill);
          setShowEditModal(true);
        }}
        onDelete={async (skillId) => {
          try {
            await apiService.deleteSkill(skillId);
            loadUserSkills();
          } catch (error) {
            console.error('Failed to delete skill:', error);
          }
        }}
      />

      <EditSkillModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        skill={selectedSkillForView}
        onSuccess={loadUserSkills}
      />

      <SessionRequestModal
        isOpen={showSessionRequestModal}
        onClose={() => setShowSessionRequestModal(false)}
        session={selectedActivity}
        onUpdate={() => {
          loadActivities();
          loadRequests();
        }}
      />

      <SessionViewModal
        isOpen={showSessionViewModal}
        onClose={() => setShowSessionViewModal(false)}
        session={selectedActivity}
        onUpdate={() => {
          loadActivities();
          loadRequests();
        }}
      />

      <SessionHistoryModal
        isOpen={showSessionHistoryModal}
        onClose={() => setShowSessionHistoryModal(false)}
        activity={selectedActivity}
        onScheduleNext={() => {
          setShowScheduleModal(true);
        }}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        activity={selectedActivity}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={selectedUserProfile}
      />
    </div>
  );
};

export default SkillBarterPage;