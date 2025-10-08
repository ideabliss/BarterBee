import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/UI';
import { currentUser } from '../data/mockData';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

const MyThingsPage = () => {
  const [activeTab, setActiveTab] = useState('things');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Things</h1>
        <p className="text-gray-600 mt-2">Manage your items and track lending requests</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('things')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'things'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Items ({currentUser.things.length})
          </button>
        </nav>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Your Items</h2>
          <Button className="flex items-center gap-2 w-full sm:w-auto">
            <PlusIcon className="w-4 h-4" />
            Add Item
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentUser.things.map((thing) => (
            <Card key={thing.id} className="overflow-hidden">
              <img src={thing.image} alt={thing.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{thing.name}</h3>
                  <Badge variant={thing.available ? "success" : "secondary"}>
                    {thing.available ? "Available" : "Borrowed"}
                  </Badge>
                </div>
                <Badge variant="outline" className="mb-2">{thing.category}</Badge>
                <p className="text-gray-600 text-sm mb-4">{thing.description}</p>
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
    </div>
  );
};

export default MyThingsPage;