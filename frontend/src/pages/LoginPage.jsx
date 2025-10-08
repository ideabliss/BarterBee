import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '../components/UI';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || '/dashboard';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    
    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ general: error.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center text-white">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-3xl backdrop-blur-sm mb-6">
                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome back, barterer! 🐝</h1>
              <p className="text-xl text-yellow-100 leading-relaxed max-w-md">
                Ready to continue building meaningful connections through bartering?
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg">🎸</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Learn Skills</h3>
                    <p className="text-sm text-yellow-100">From real experts</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Share Items</h3>
                    <p className="text-sm text-yellow-100">Without buying</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Get Opinions</h3>
                    <p className="text-sm text-yellow-100">From community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 right-5 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Back button for mobile */}
            <div className="lg:hidden">
              <Link 
                to="/" 
                className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to home
              </Link>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="bg-yellow-400 text-white p-3 rounded-2xl">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Sign in to your account
              </h2>
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-yellow-600 hover:text-yellow-500">
                  Create one here
                </Link>
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="text-yellow-600 hover:text-yellow-500 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {errors.general && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {errors.general}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  loading={isLoading}
                >
                  Sign in to BarterBee
                </Button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to BarterBee?</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center w-full px-6 py-3 border border-yellow-300 rounded-xl text-yellow-700 bg-yellow-50 hover:bg-yellow-100 font-medium transition-colors"
                  >
                    Create your account
                  </Link>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;