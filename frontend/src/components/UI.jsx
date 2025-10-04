import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon = null,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-500 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-500 shadow-md hover:shadow-lg border border-gray-300',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-yellow-500 hover:shadow-md',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 hover:shadow-md'
  };
  
  const sizes = {
    sm: 'px-4 py-2.5 min-h-[44px] text-sm rounded-xl mobile-button touch-target',
    md: 'px-6 py-3 min-h-[48px] text-sm rounded-xl mobile-button touch-target',
    lg: 'px-8 py-4 min-h-[52px] text-base rounded-xl mobile-button touch-target'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const Input = ({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  icon,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`w-full ${icon ? 'pl-10' : ''} px-4 py-3 sm:py-3 min-h-[48px] touch-target border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-300 hover:border-gray-300 text-base sm:text-sm ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/50' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm ${hover ? 'hover:shadow-xl hover:scale-[1.02] hover:border-gray-200/50 transition-all duration-300 transform' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300',
    primary: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300',
    success: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300',
    warning: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300',
    danger: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };
  
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 ring-2 ring-white shadow-lg ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-300 hover:scale-110" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          <svg className="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            {tab.count && (
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}></div>
        <div className={`relative bg-white rounded-2xl shadow-2xl ${maxWidth} w-full transform transition-all duration-300 scale-100 animate-slideUp border border-gray-200`}>
          <div className="flex items-center justify-between p-8 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProgressBar = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index < currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : index === currentStep
                  ? 'bg-blue-100 border-blue-600 text-blue-600'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-900">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 mx-4 h-0.5 bg-gray-300">
              <div
                className={`h-full transition-all duration-300 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const FloatingActionButton = ({ onClick, icon, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-2xl shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-300 hover:scale-110 active:scale-95 hover:from-blue-700 hover:to-purple-700 backdrop-blur-md ${className}`}
    >
      {icon}
    </button>
  );
};

export const NotificationDot = ({ show, className = '' }) => {
  if (!show) return null;
  
  return (
    <div className={`absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg ring-2 ring-white animate-pulse ${className}`}></div>
  );
};