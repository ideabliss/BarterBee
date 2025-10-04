import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-optimized header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Welcome to BarterBee! 🐝
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Connect, share, and barter with your community. Exchange skills, borrow items, and get opinions - all without money!
          </p>
        </div>
        
        {/* Mobile-optimized service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Skills Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border hover:shadow-xl transition-shadow duration-300 touch-target">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">Skills</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Exchange your skills with others through video sessions</p>
              </div>
            </div>
            <Link 
              to="/skill-search" 
              className="inline-flex items-center w-full sm:w-auto justify-center sm:justify-start px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200"
            >
              Browse Skills
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Things Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border hover:shadow-xl transition-shadow duration-300 touch-target">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-2">Things</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Share physical items with community members</p>
              </div>
            </div>
            <Link 
              to="/thing-search" 
              className="inline-flex items-center w-full sm:w-auto justify-center sm:justify-start px-4 py-2.5 text-sm font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200"
            >
              Browse Things
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Opinions Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border hover:shadow-xl transition-shadow duration-300 touch-target sm:col-span-2 lg:col-span-1">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-purple-700 mb-2">Opinions</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Get help making decisions through community polls</p>
              </div>
            </div>
            <Link 
              to="/polls" 
              className="inline-flex items-center w-full sm:w-auto justify-center sm:justify-start px-4 py-2.5 text-sm font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors duration-200"
            >
              Browse Polls
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Mobile-optimized call-to-action */}
        <div className="text-center px-4">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6 sm:p-8 mb-6 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Ready to Start Bartering?</h2>
            <p className="text-yellow-100 mb-4 sm:mb-6 text-sm sm:text-base">Join thousands of community members sharing skills, items, and wisdom</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center w-full sm:w-auto justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-yellow-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 touch-target"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Go to Dashboard
            </Link>
          </div>
          
          {/* Quick stats for mobile */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-900">2.5k+</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-900">10k+</div>
              <div className="text-xs sm:text-sm text-gray-600">Exchanges</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-900">95%</div>
              <div className="text-xs sm:text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
