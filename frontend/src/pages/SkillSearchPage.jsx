import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { mockUsers, currentUser } from '../data/mockData';
import SkillCard from '../components/SkillCard';
import SkillSearchFilters from '../components/SkillSearchFilters';
import BarterRequestModal from '../components/BarterRequestModal';
import RecentActivity from '../components/RecentActivity';

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



  const recentActivities = [
    {
      id: 1,
      type: 'skill_request',
      title: 'Guitar lesson request sent',
      description: 'Request sent to Rudra Patel for guitar lessons',
      timestamp: '2024-03-15T16:30:00Z',
      status: 'pending',
      actionUrl: '/skills/my-skills'
    },
    {
      id: 2,
      type: 'skill_request',
      title: 'Cooking lesson request accepted',
      description: 'Priya Singh accepted your cooking lesson request',
      timestamp: '2024-03-15T14:20:00Z',
      status: 'accepted',
      actionUrl: '/sessions'
    },
    {
      id: 3,
      type: 'skill_request',
      title: 'Photography request declined',
      description: 'Alex Kumar declined your photography request',
      timestamp: '2024-03-14T18:30:00Z',
      status: 'declined',
      actionUrl: '/skills/search'
    }
  ];

  const handleBarterSubmit = (requestData) => {
    console.log('Skill barter request:', requestData);
    // Add to recent activities
    const newActivity = {
      id: Date.now(),
      type: 'skill_request',
      title: `${requestData.toSkill.name} request sent`,
      description: `Request sent to ${requestData.toSkill.user.name}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      actionUrl: '/skills/my-skills'
    };
    setBarterModalOpen(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Skills to Learn 🎯
        </h1>
        <p className="text-gray-600">
          Connect with skilled individuals and exchange knowledge through live video sessions.
        </p>
      </div>

        <SkillSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          categories={categories}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredSkills.length} Skills Available
              </h2>
              <select className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white">
                <option>Sort by Relevance</option>
                <option>Sort by Rating</option>
                <option>Sort by Response Time</option>
                <option>Sort by Sessions Count</option>
              </select>
            </div>

            <div className="space-y-6">
              {filteredSkills.length > 0 ? (
                filteredSkills.map(skill => (
                  <SkillCard 
                    key={`${skill.user.id}-${skill.id}`} 
                    skill={skill} 
                    onBarterRequest={handleBarterRequest}
                  />
                ))
              ) : (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Skills Found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
                  >
                    Clear Filters
                  </Button>
                </Card>
              )}
            </div>
          </main>

          <aside className="w-full lg:w-80">
            <div className="lg:sticky lg:top-6">
              <Card className="p-6">
                <RecentActivity activities={recentActivities} />
              </Card>
            </div>
          </aside>
      </div>

      <BarterRequestModal
        isOpen={barterModalOpen}
        onClose={() => setBarterModalOpen(false)}
        selectedSkill={selectedSkill}
        onSubmit={handleBarterSubmit}
      />
    </div>
  );
};

export default SkillSearchPage;