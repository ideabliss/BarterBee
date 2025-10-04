# BarterBee Backend API Requirements

This document outlines all the API endpoints that need to be implemented in the backend to replace the current mock data and console.log statements in the frontend.

## Authentication Endpoints

### POST /auth/login
- **Purpose**: User authentication
- **Location**: `frontend/src/pages/LoginPage.jsx`
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, user: UserObject }`
- **Current Implementation**: Direct navigation (no validation)

### POST /auth/register
- **Purpose**: New user registration
- **Location**: `frontend/src/pages/RegisterPage.jsx`, `frontend/src/pages/NewRegisterPage.jsx`
- **Request Body**: `{ email: string, password: string, name: string, username: string, contact: string, address: string }`
- **Response**: `{ token: string, user: UserObject }`
- **Current Implementation**: Direct navigation (no data saving)

## User Profile Endpoints

### GET /users/profile
- **Purpose**: Get current user profile data
- **Location**: Used throughout the app via `currentUser` import
- **Response**: `UserObject` with skills, things, opinions, points
- **Current Implementation**: Static mock data

### PUT /users/profile
- **Purpose**: Update user profile information
- **Location**: ProfilePage edit functionality
- **Request Body**: Updated user fields
- **Response**: Updated `UserObject`

### POST /users/skills
- **Purpose**: Add new skill to user profile
- **Location**: `frontend/src/pages/ProfilePage.jsx` - AddItemModal
- **Request Body**: `{ name: string, description: string, category: string, image: string }`
- **Response**: Created skill object
- **Current Implementation**: Console log only

### DELETE /users/skills/:skillId
- **Purpose**: Delete user's skill
- **Location**: `frontend/src/pages/ProfilePage.jsx` - SkillCard delete button
- **Response**: Success confirmation
- **Current Implementation**: Console log only

### POST /users/things
- **Purpose**: Add new thing to user profile
- **Location**: `frontend/src/pages/ProfilePage.jsx` - AddItemModal
- **Request Body**: `{ name: string, description: string, category: string, image: string, available: boolean }`
- **Response**: Created thing object
- **Current Implementation**: Console log only

### DELETE /users/things/:thingId
- **Purpose**: Delete user's thing
- **Location**: `frontend/src/pages/ProfilePage.jsx` - ThingCard delete button
- **Response**: Success confirmation
- **Current Implementation**: Console log only

### POST /users/opinions
- **Purpose**: Add new opinion/poll to user profile
- **Location**: `frontend/src/pages/ProfilePage.jsx` - AddItemModal
- **Request Body**: Opinion/poll data
- **Response**: Created opinion object
- **Current Implementation**: Console log only

### DELETE /users/opinions/:opinionId
- **Purpose**: Delete user's opinion/poll
- **Location**: `frontend/src/pages/ProfilePage.jsx` - OpinionCard delete button
- **Response**: Success confirmation
- **Current Implementation**: Console log only

## Barter Request Endpoints

### POST /barter/skills
- **Purpose**: Create skill barter request
- **Location**: `frontend/src/pages/SkillSearchPage.jsx` - BarterRequestModal
- **Request Body**: `{ toSkill: skillObject, fromSkill: skillId, message: string, scheduledDate: string, scheduledTime: string }`
- **Response**: Created barter request object
- **Current Implementation**: Console log only

### POST /barter/things
- **Purpose**: Create thing barter request
- **Location**: `frontend/src/pages/ThingSearchPage.jsx` - BarterRequestModal
- **Request Body**: `{ toThing: thingObject, fromThing: thingId, barterPeriod: number, message: string }`
- **Response**: Created barter request object
- **Current Implementation**: Console log only

### GET /barter/requests
- **Purpose**: Get user's barter requests (sent and received)
- **Location**: Dashboard activity feed, ProfilePage notifications
- **Response**: Array of barter request objects
- **Current Implementation**: Static mock data

### PUT /barter/requests/:requestId
- **Purpose**: Update barter request status (accept/reject)
- **Location**: ProfilePage pending requests, NotificationsPage
- **Request Body**: `{ status: 'accepted' | 'rejected' | 'completed' }`
- **Response**: Updated barter request object

## Search & Discovery Endpoints

### GET /search/skills
- **Purpose**: Search for available skills
- **Location**: `frontend/src/pages/SkillSearchPage.jsx`
- **Query Parameters**: `{ search?: string, category?: string, minRating?: number, responseTime?: number, experience?: string }`
- **Response**: Array of skill objects with user information
- **Current Implementation**: Static mock data filtering

### GET /search/things
- **Purpose**: Search for available things
- **Location**: `frontend/src/pages/ThingSearchPage.jsx`
- **Query Parameters**: `{ search?: string, category?: string, available?: boolean }`
- **Response**: Array of thing objects with user information
- **Current Implementation**: Static mock data filtering

### GET /users/:userId
- **Purpose**: Get public user profile
- **Location**: Skill/Thing cards "View Profile" links
- **Response**: Public user information
- **Current Implementation**: Not implemented (links exist but no handler)

## Polling System Endpoints

### GET /polls
- **Purpose**: Get all available polls
- **Location**: `frontend/src/pages/PollsPage.jsx`
- **Query Parameters**: `{ filter?: 'all' | 'unanswered' | 'answered' }`
- **Response**: Array of poll objects
- **Current Implementation**: Static mock data

### POST /polls
- **Purpose**: Create new poll
- **Location**: `frontend/src/pages/PollsPage.jsx` - CreatePollModal
- **Request Body**: `{ question: string, type: 'text' | 'image', options: string[] | ImageOption[] }`
- **Response**: Created poll object
- **Current Implementation**: Console log only (costs 3 points)

### POST /polls/:pollId/vote
- **Purpose**: Vote on a poll
- **Location**: `frontend/src/pages/PollsPage.jsx` - Poll voting buttons
- **Request Body**: `{ optionIndex: number }`
- **Response**: Updated poll results, user gains points
- **Current Implementation**: Console log only (adds to voted set)

## Notification Endpoints

### GET /notifications
- **Purpose**: Get user notifications
- **Location**: `frontend/src/pages/NotificationsPage.jsx`, Navbar badge
- **Response**: Array of notification objects
- **Current Implementation**: Static mock data

### PUT /notifications/:notificationId/read
- **Purpose**: Mark notification as read
- **Location**: `frontend/src/pages/NotificationsPage.jsx`
- **Response**: Success confirmation
- **Current Implementation**: Local state update only

### PUT /notifications/mark-all-read
- **Purpose**: Mark all notifications as read
- **Location**: `frontend/src/pages/NotificationsPage.jsx`
- **Response**: Success confirmation
- **Current Implementation**: Local state update only

## Data Models

### UserObject
```typescript
{
  id: number,
  username: string,
  name: string,
  email: string,
  contact: string,
  address: string,
  profilePicture: string,
  skills: SkillObject[],
  things: ThingObject[],
  opinions: OpinionObject[],
  points: number
}
```

### SkillObject
```typescript
{
  id: number,
  name: string,
  description: string,
  category: string,
  image: string,
  rating: number,
  sessions: number,
  responseTime: number
}
```

### ThingObject
```typescript
{
  id: number,
  name: string,
  description: string,
  category: string,
  image: string,
  available: boolean
}
```

### BarterRequestObject
```typescript
{
  id: number,
  type: 'skill' | 'thing',
  from: UserObject,
  to: UserObject,
  fromSkill?: SkillObject,
  toSkill?: SkillObject,
  fromThing?: ThingObject,
  toThing?: ThingObject,
  status: 'pending' | 'accepted' | 'rejected' | 'completed',
  message: string,
  createdAt: string,
  scheduledDate?: string,
  scheduledTime?: string,
  barterPeriod?: number,
  trackingInfo?: object
}
```

### PollObject
```typescript
{
  id: number,
  userId: number,
  user: UserObject,
  question: string,
  type: 'text' | 'image',
  options: string[] | ImageOption[],
  votes: number[],
  totalVotes: number,
  userVoted: boolean,
  createdAt: string
}
```

### NotificationObject
```typescript
{
  id: number,
  type: 'barter_request' | 'session_reminder' | 'package_update' | string,
  title: string,
  message: string,
  read: boolean,
  createdAt: string,
  actionUrl?: string
}
```

## Next Steps

1. **Choose Backend Technology**: Node.js/Express, Python/Django, etc.
2. **Set up Database**: PostgreSQL, MongoDB, etc.
3. **Implement Authentication**: JWT tokens, password hashing
4. **Create API Routes**: RESTful endpoints as outlined above
5. **Replace Frontend Mock Data**: Update imports and API calls
6. **Add Error Handling**: Frontend error states and backend validation
7. **Implement Real-time Features**: WebSockets for notifications, live sessions
8. **Add File Upload**: For profile pictures and images
9. **Implement Search**: Full-text search capabilities
10. **Add Security**: Rate limiting, input validation, CORS

## Current Status

✅ **Removed API Simulation**: All setTimeout-based fake API calls removed
✅ **Added TODO Comments**: Clear indicators where backend calls are needed  
✅ **Documented Endpoints**: Complete API specification ready for implementation
🔄 **Ready for Backend Development**: Frontend prepared for real API integration

The frontend is now clean and ready to be connected to a real backend API. All mock data is clearly separated in `/data/mockData.js` and can be easily replaced with actual API calls.