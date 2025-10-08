import React from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Card, Button } from './UI';

const SkillSearchFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  showFilters, 
  setShowFilters, 
  categories 
}) => (
  <Card className="p-4 sm:p-6 mb-6 shadow-lg">
    <div className="flex flex-col space-y-4">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search skills, descriptions, or instructors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-sm"
        />
      </div>
      
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
          className="w-full sm:w-auto bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
          <span className="sm:hidden">Advanced Filters</span>
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>
    </div>
    
    {showFilters && (
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <select className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-sm">
              <option value="0">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Time</label>
            <select className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-sm">
              <option value="">Any Time</option>
              <option value="1">Within 1 hour</option>
              <option value="6">Within 6 hours</option>
              <option value="24">Within 24 hours</option>
            </select>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
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
);

export default SkillSearchFilters;