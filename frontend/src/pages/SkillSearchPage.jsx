import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Card, Input, Button, Badge, Avatar, Modal } from '../components/UI';
import { mockUsers, currentUser } from '../data/mockData';

const SkillSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [barterModalOpen, setBarterModalOpen] = useState(false);

  // Get all skills from all users except current user
  const allSkills = mockUsers
    .filter(user => user.id !== currentUser.id)
    .flatMap(user => 
      user.skills.map(skill => ({
        ...skill,
        user: user,
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        sessions: Math.floor(Math.random() * 50) + 5, // Mock session count
        responseTime: Math.floor(Math.random() * 12) + 1 // Mock response time in hours
      }))
    );

  const categories = ['all', ...new Set(allSkills.map(skill => skill.category.toLowerCase()))];

  const filteredSkills = allSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           skill.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBarterRequest = (skill) => {
    setSelectedSkill(skill);
    setBarterModalOpen(true);
  };

  const SkillCard = ({ skill }) => (
    <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-400">
      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
        <img
          src={skill.image}
          alt={skill.name}
          className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-xl sm:rounded-lg"
        />
        
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{skill.name}</h3>
              <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{skill.description}</p>
            </div>
            <Badge variant="primary" className="self-start bg-yellow-100 text-yellow-800 border-yellow-200">
              {skill.category}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{skill.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <UserIcon className="h-4 w-4" />
              <span>{skill.sessions} sessions</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>Responds in {skill.responseTime}h</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <Avatar src={skill.user.profilePicture} alt={skill.user.name} size="sm" />
              <div>
                <div className="text-sm font-medium text-gray-900">{skill.user.name}</div>
                <div className="text-xs text-gray-500">@{skill.user.username}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link to={`/user/${skill.user.id}`} className="w-full sm:w-auto">
                <Button size="sm" variant="outline" className="w-full sm:w-auto mobile-button">
                  View Profile
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="primary"
                onClick={() => handleBarterRequest(skill)}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white mobile-button"
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const BarterRequestModal = () => {
    const [selectedMySkill, setSelectedMySkill] = useState('');
    const [message, setMessage] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      // Here you would send the barter request
      console.log('Barter request sent:', {
        toSkill: selectedSkill,
        fromSkill: selectedMySkill,
        message,
        scheduledDate,
        scheduledTime
      });
      setBarterModalOpen(false);
    };

    return (
      <Modal
        isOpen={barterModalOpen}
        onClose={() => setBarterModalOpen(false)}
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
            >
              <option value="">Select a skill to offer</option>
              {currentUser.skills.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} - {skill.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Session Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Time
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
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
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setBarterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Send Request
            </Button>
          </div>
        </form>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-optimized Header */}
        <div className="mb-6 sm:mb-8 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Find Skills to Learn 🎯
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
            Connect with skilled individuals and exchange knowledge through live video sessions.
          </p>
        </div>

        {/* Mobile-optimized Search and Filters */}
        <Card className="p-4 sm:p-6 mb-6 shadow-lg">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search skills, descriptions, or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-sm mobile-text"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                icon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
                className="w-full sm:w-auto bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800 mobile-button"
              >
                <span className="sm:hidden">Advanced Filters</span>
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>
            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <select className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-sm">
                      <option value="0">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Time
                    </label>
                    <select className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-sm">
                      <option value="">Any Time</option>
                      <option value="1">Within 1 hour</option>
                      <option value="6">Within 6 hours</option>
                      <option value="24">Within 24 hours</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-sm">
                      <option value="">Any Experience</option>
                      <option value="beginner">Beginner Friendly</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
        </Card>

        {/* Mobile-optimized Results Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {filteredSkills.length} Skills Available
            </h2>
            <select className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white">
              <option>Sort by Relevance</option>
              <option>Sort by Rating</option>
              <option>Sort by Response Time</option>
              <option>Sort by Sessions Count</option>
            </select>
          </div>
        </div>        {/* Mobile-optimized Skills Grid */}
        <div className="space-y-4 sm:space-y-6">
          {filteredSkills.length > 0 ? (
            filteredSkills.map(skill => (
              <SkillCard key={`${skill.user.id}-${skill.id}`} skill={skill} />
            ))
          ) : (
            <Card className="p-8 sm:p-12 text-center shadow-lg">
              <div className="text-4xl sm:text-6xl mb-4">🔍</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Skills Found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white mobile-button"
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </div>

        {/* Barter Request Modal */}
        <BarterRequestModal />
      </div>
    </div>
  );
};

export default SkillSearchPage;