import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/NewRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import LiveSessionPage from './pages/LiveSessionPage';
import SessionReviewPage from './pages/SessionReviewPage';
import SkillBarterPage from './pages/SkillBarterPage';
import ItemBarterPage from './pages/ItemBarterPage';
import OpinionBarterPage from './pages/OpinionBarterPage';



function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Protected App Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/skills" element={
        <ProtectedRoute>
          <AppLayout><SkillBarterPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/things" element={
        <ProtectedRoute>
          <AppLayout><ItemBarterPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/opinions" element={
        <ProtectedRoute>
          <AppLayout><OpinionBarterPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/home" element={
        <ProtectedRoute>
          <AppLayout><HomePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout><NotificationsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/session/:sessionId" element={
        <ProtectedRoute>
          <LiveSessionPage />
        </ProtectedRoute>
      } />
      <Route path="/session/review" element={
        <ProtectedRoute>
          <SessionReviewPage />
        </ProtectedRoute>
      } />
      
      {/* Catch all route - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
