import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Input, Button, Badge, Avatar, Modal } from '../components/UI';
import { mockUsers, currentUser } from '../data/mockData';

const ThingSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedThing, setSelectedThing] = useState(null);
  const [barterModalOpen, setBarterModalOpen] = useState(false);

  // Get all things from all users except current user
  const allThings = mockUsers
    .filter(user => user.id !== currentUser.id)
    .flatMap(user => 
      user.things.map(thing => ({
        ...thing,
        user: user,
        condition: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
        distance: Math.floor(Math.random() * 50) + 1 + ' km away'
      }))
    );

  const categories = ['all', ...new Set(allThings.map(thing => thing.category.toLowerCase()))];

  const filteredThings = allThings.filter(thing => {
    const matchesSearch = thing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thing.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           thing.category.toLowerCase() === selectedCategory;
    const isAvailable = thing.available;
    return matchesSearch && matchesCategory && isAvailable;
  });

  const handleBarterRequest = (thing) => {
    setSelectedThing(thing);
    setBarterModalOpen(true);
  };

  const ThingCard = ({ thing }) => (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
        <img
          src={thing.image}
          alt={thing.name}
          className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
        />
        
        <div className="flex-1 w-full">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{thing.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{thing.description}</p>
            </div>
            <div className="flex flex-col items-end space-y-1 shrink-0">
              <Badge variant="primary" className="text-xs">{thing.category}</Badge>
              {thing.available && <Badge variant="success" className="text-xs">Available</Badge>}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-3 mb-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="h-4 w-4" />
              <span>{thing.condition}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPinIcon className="h-4 w-4" />
              <span>{thing.distance}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Avatar src={thing.user.profilePicture} alt={thing.user.name} size="sm" />
              <div>
                <div className="text-sm font-medium text-gray-900">{thing.user.name}</div>
                <div className="text-xs text-gray-500">@{thing.user.username}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
              <Link to={`/user/${thing.user.id}`} className="w-full sm:w-auto">
                <Button size="sm" variant="outline" className="w-full">
                  View Profile
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="primary"
                onClick={() => handleBarterRequest(thing)}
                className="w-full sm:w-auto"
              >
                Request Barter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const BarterRequestModal = () => {
    const [selectedMyThing, setSelectedMyThing] = useState('');
    const [barterPeriod, setBarterPeriod] = useState('7');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      // TODO: Replace with actual API call to backend
      // Example: await barterAPI.createThingRequest({ toThing: selectedThing, fromThing: selectedMyThing, barterPeriod, message });
      console.log('Thing barter request (needs backend implementation):', {
        toThing: selectedThing,
        fromThing: selectedMyThing,
        barterPeriod,
        message
      });
      setBarterModalOpen(false);
    };

    return (
      <Modal
        isOpen={barterModalOpen}
        onClose={() => setBarterModalOpen(false)}
        title={`Request ${selectedThing?.name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={selectedThing?.image}
                alt={selectedThing?.name}
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
              />
              <div>
                <div className="font-medium text-sm sm:text-base text-gray-900">{selectedThing?.name}</div>
                <div className="text-xs sm:text-sm text-gray-600">from {selectedThing?.user.name}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Item to Exchange
            </label>
            <select
              value={selectedMyThing}
              onChange={(e) => setSelectedMyThing(e.target.value)}
              className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select an item to offer</option>
              {currentUser.things.filter(thing => thing.available).map(thing => (
                <option key={thing.id} value={thing.id}>
                  {thing.name} - {thing.category}
                </option>
              ))}
            </select>
            {currentUser.things.filter(thing => thing.available).length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                You don't have any available items. <Link to="/profile?tab=things" className="text-blue-600 hover:underline">Add items to your profile</Link>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barter Period
            </label>
            <select
              value={barterPeriod}
              onChange={(e) => setBarterPeriod(e.target.value)}
              className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="3">3 days</option>
              <option value="7">1 week</option>
              <option value="14">2 weeks</option>
              <option value="30">1 month</option>
              <option value="custom">Custom period</option>
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
              placeholder="Tell them why you need this item..."
              className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div className="text-xs sm:text-sm text-blue-800">
              <strong>Note:</strong> Both parties will exchange postal addresses upon acceptance. 
              Items should be returned in the same condition after the barter period.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 w-full"
              onClick={() => setBarterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 w-full"
              disabled={currentUser.things.filter(thing => thing.available).length === 0}
            >
              Send Request
            </Button>
          </div>
        </form>
      </Modal>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mb-16 sm:mb-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse Items to Borrow</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Find items you need temporarily and offer something in return through postal exchange.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="w-full">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
              className="w-full sm:w-auto"
            >
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Any Condition</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Any Distance</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="available">Available Now</option>
                  <option value="all">All Items</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {filteredThings.length} Items Available
          </h2>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>Sort by Relevance</option>
            <option>Sort by Distance</option>
            <option>Sort by Condition</option>
            <option>Sort by Recently Added</option>
          </select>
        </div>
      </div>

      {/* Things Grid */}
      <div className="space-y-4 sm:space-y-6">
        {filteredThings.length > 0 ? (
          filteredThings.map(thing => (
            <ThingCard key={`${thing.user.id}-${thing.id}`} thing={thing} />
          ))
        ) : (
          <Card className="p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4">📦</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Barter Request Modal */}
      <BarterRequestModal />
    </div>
  );
};

export default ThingSearchPage;