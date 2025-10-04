import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/NewRegisterPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SkillSearchPage from './pages/SkillSearchPage';
import ThingSearchPage from './pages/ThingSearchPage';
import PollsPage from './pages/PollsPage';
import NotificationsPage from './pages/NotificationsPage';
import LiveSessionPage from './pages/LiveSessionPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Dashboard (Main App) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Legacy Routes for existing pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Skill Barter Routes */}
        <Route path="/skills" element={<SkillSearchPage />} />
        <Route path="/skills/search" element={<SkillSearchPage />} />
        <Route path="/session/:sessionId" element={<LiveSessionPage />} />
        
        {/* Thing Barter Routes */}
        <Route path="/things" element={<ThingSearchPage />} />
        <Route path="/things/search" element={<ThingSearchPage />} />
        
        {/* Opinion Barter Routes */}
        <Route path="/opinions" element={<PollsPage />} />
        <Route path="/polls" element={<PollsPage />} />
        
        {/* Catch all route - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
