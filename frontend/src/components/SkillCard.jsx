import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { Card, Button, Badge, Avatar } from './UI';

const SkillCard = ({ skill, onBarterRequest, onViewProfile }) => (
  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white">
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-48 h-48 md:h-32 flex-shrink-0">
        <img
          src={skill.image}
          alt={skill.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{skill.name}</h3>
              <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1 self-start">
                {skill.category}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">{skill.description}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-4">
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{skill.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <UserIcon className="h-4 w-4" />
            <span>{skill.sessions} sessions</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Responds in {skill.responseTime}h</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={skill.user.profilePicture} alt={skill.user.name} size="sm" />
            <div>
              <div className="font-medium text-gray-900">{skill.user.name}</div>
              <div className="text-sm text-gray-500">@{skill.user.username}</div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full md:w-auto"
              onClick={() => onViewProfile && onViewProfile(skill.user)}
            >
              View Profile
            </Button>
            <Button 
              size="sm" 
              onClick={() => onBarterRequest(skill)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-6 w-full md:w-auto"
            >
              Send Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export default SkillCard;