import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { PlusIcon, EyeIcon, ClockIcon, TruckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ItemAcceptDeclineModal from '../components/modals/ItemAcceptDeclineModal';
import ItemBarterRequestModal from '../components/modals/ItemBarterRequestModal';
import AddItemModal from '../components/modals/AddItemModal';
import ViewItemModal from '../components/modals/ViewItemModal';
import EditItemModal from '../components/modals/EditItemModal';
import ProfileModal from '../components/modals/ProfileModal';
import ChatModal from '../components/modals/ChatModal';
import TrackingModal from '../components/modals/TrackingModal';

const ItemBarterPage = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showItemAcceptDeclineModal, setShowItemAcceptDeclineModal] = useState(false);
  const [showBarterRequestModal, setShowBarterRequestModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [itemRequests, setItemRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadItems();
    loadUserItems();
    loadRequests();
    loadActivities();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadItems();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.getItems({ search: searchTerm });
      setAllItems(response.items || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserItems = async () => {
    try {
      const response = await apiService.getUserItems();
      setUserItems(response.items || []);
    } catch (error) {
      console.error('Failed to load user items:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await apiService.getBarterRequests();
      console.log('All barter requests:', response.requests);
      const itemReqs = response.requests?.filter(req => req.type === 'item') || [];
      console.log('Filtered item requests:', itemReqs);
      setItemRequests(itemReqs);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await apiService.getActivity();
      setActivities(response.activities?.filter(act => act.type === 'item') || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      await apiService.createItem(itemData);
      setShowAddModal(false);
      loadUserItems();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const filteredItems = allItems.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Item Barter</h1>
        <p className="text-gray-600 mt-2">Find items to borrow, manage your items, and track exchanges</p>
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
            Find Items
          </button>
          <button
            onClick={() => setActiveTab('my-items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-items'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Items ({userItems.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Requests ({itemRequests.length})
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

      {/* Find Items Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading items...</div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <Card key={`${item.users?.id || item.user_id}-${item.id}`} className="overflow-hidden">
                  <img src={item.image || 'https://images.unsplash.com/photo-1586953268751-09cb3ac5c228?w=300&h=200&fit=crop'} alt={item.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant={item.is_available ? "success" : "secondary"}>
                        {item.is_available ? "Available" : "Borrowed"}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="mb-2">{item.category}</Badge>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <img src={item.users?.profile_picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'} alt={item.users?.name || 'User'} className="w-8 h-8 rounded-full" />
                      <span className="text-sm text-gray-600">{item.users?.name || 'Unknown User'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedUserProfile(item.users);
                          setShowProfileModal(true);
                        }}
                      >
                        View Profile
                      </Button>
                      <Button 
                        className="flex-1" 
                        disabled={!item.is_available}
                        onClick={() => {
                          setSelectedItemForRequest(item);
                          setShowBarterRequestModal(true);
                        }}
                      >
                        {item.is_available ? 'Send Request' : 'Not Available'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse all available items.</p>
            </div>
          )}
        </div>
      )}

      {/* My Items Tab */}
      {activeTab === 'my-items' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Your Items</h2>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <PlusIcon className="w-4 h-4" />
              Add Item
            </Button>
          </div>
          
          {userItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <img src={item.image || 'https://images.unsplash.com/photo-1586953268751-09cb3ac5c228?w=300&h=200&fit=crop'} alt={item.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant={item.is_available ? "success" : "secondary"}>
                        {item.is_available ? "Available" : "Borrowed"}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="mb-2">{item.category}</Badge>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedItemForView(item);
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
                          setSelectedItemForView(item);
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
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Added Yet</h3>
              <p className="text-gray-600 mb-4">Share items you own that others might need temporarily.</p>
              <Button onClick={() => setShowAddModal(true)}>Add Your First Item</Button>
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Item Exchange Requests</h2>
          <div className="space-y-4">
            {itemRequests.length > 0 ? itemRequests.map((request) => (
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
                          Item exchange request
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{request.message || 'No message provided'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      <span>Barter Period: {request.barter_period || 14} days</span>
                    </div>
                    
                    {(request.status === 'shipped' || request.status === 'ongoing') && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Shipping Status</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${request.status === 'shipped' || request.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Package Sent
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${request.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Package Received
                          </div>
                        </div>
                      </div>
                    )}
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
                              fromUserId: request.from_user_id,
                              toUserId: request.to_user_id,
                              partnerName: request.from_user?.name || 'Unknown User',
                              partnerAvatar: request.from_user?.profile_picture,
                              requestMessage: request.message,
                              barterPeriod: `${request.barter_period || 14} days`,
                              shippingMethod: 'Standard postal'
                            });
                            setShowItemAcceptDeclineModal(true);
                          }}
                        >
                          Respond
                        </Button>
                      </div>
                    )}
                    {request.status === 'accepted' && (
                      <Button 
                        size="sm" 
                        className="flex items-center gap-1 w-full md:w-auto"
                        onClick={() => {
                          setSelectedActivity({
                            requestId: request.id,
                            partnerName: request.from_user?.name || 'Unknown User',
                            itemName: request.to_item?.name || request.from_item?.name || 'Item',
                            barterPeriod: `${request.barter_period || 14} days`
                          });
                          setShowTrackingModal(true);
                        }}
                      >
                        <TruckIcon className="w-4 h-4" />
                        Add Tracking
                      </Button>
                    )}
                    {(request.status === 'shipped' || request.status === 'ongoing') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1 w-full md:w-auto"
                        onClick={() => {
                          setSelectedActivity({
                            requestId: request.id,
                            partnerName: request.from_user?.name || 'Unknown User',
                            itemName: request.to_item?.name || request.from_item?.name || 'Item',
                            barterPeriod: `${request.barter_period || 14} days`,
                            status: request.status
                          });
                          setShowTrackingModal(true);
                        }}
                      >
                        <TruckIcon className="w-4 h-4" />
                        View Tracking
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Yet</h3>
                <p className="text-gray-600">Item exchange requests will appear here when others want to borrow from you.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Item Activity</h2>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {activity.type === 'item' ? 'Item Exchange' : 'Activity'}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {activity.message || `Activity with ${activity.from_user?.name || activity.to_user?.name}`}
                      </p>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 md:flex-none"
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
                        {(activity.status === 'accepted' || activity.status === 'shipped' || activity.status === 'ongoing') && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 md:flex-none flex items-center gap-1"
                            onClick={() => {
                              setSelectedActivity({
                                requestId: activity.id,
                                partnerName: activity.from_user?.name || activity.to_user?.name,
                                itemName: activity.from_item?.name || activity.to_item?.name || 'Item',
                                barterPeriod: `${activity.barter_period || 14} days`,
                                status: activity.status
                              });
                              setShowTrackingModal(true);
                            }}
                          >
                            <TruckIcon className="w-4 h-4" />
                            Track
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-600">Your item exchange activities will appear here once you start bartering.</p>
            </div>
          )}
        </div>
      )}



      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
      />

      <ItemBarterRequestModal
        isOpen={showBarterRequestModal}
        onClose={() => setShowBarterRequestModal(false)}
        item={selectedItemForRequest}
        userItems={userItems}
        onSubmit={async (requestData) => {
          try {
            await apiService.createBarterRequest(requestData);
            loadRequests();
          } catch (error) {
            console.error('Failed to create item request:', error);
          }
        }}
      />

      <ItemAcceptDeclineModal
        isOpen={showItemAcceptDeclineModal}
        onClose={() => setShowItemAcceptDeclineModal(false)}
        activity={selectedActivity}
        currentUserId={user?.id}
        onAccept={async (requestId, message) => {
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
        }}
        onDecline={async (requestId, message) => {
          try {
            const status = selectedActivity?.fromUserId === user?.id ? 'cancelled' : 'declined';
            await apiService.updateBarterStatus(requestId, status);
            if (message) {
              await apiService.sendMessage({
                barter_request_id: requestId,
                message
              });
            }
            loadRequests();
            loadActivities();
          } catch (error) {
            console.error('Failed to update request:', error);
          }
        }}
      />

      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        activity={selectedActivity}
      />

      <ViewItemModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        item={selectedItemForView}
        onEdit={(item) => {
          setSelectedItemForView(item);
          setShowEditModal(true);
        }}
        onDelete={async (itemId) => {
          try {
            await apiService.deleteItem(itemId);
            loadUserItems();
          } catch (error) {
            console.error('Failed to delete item:', error);
          }
        }}
      />

      <EditItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={selectedItemForView}
        onSuccess={loadUserItems}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={selectedUserProfile}
      />

      <TrackingModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        activity={selectedActivity}
        onUpdate={() => {
          loadRequests();
          loadActivities();
        }}
      />
    </div>
  );
};

export default ItemBarterPage;