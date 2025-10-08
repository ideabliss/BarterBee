import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '../components/UI';
import apiService from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await apiService.forgotPassword(email);
      setMessage('Password reset link sent to your email');
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center text-white">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-3xl backdrop-blur-sm mb-6">
                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4">Reset Your Password 🔑</h1>
              <p className="text-xl text-yellow-100 leading-relaxed max-w-md">
                Don't worry! We'll help you get back to bartering in no time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden">
              <Link 
                to="/login" 
                className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to login
              </Link>
            </div>

            <div className="text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="bg-yellow-400 text-white p-3 rounded-2xl">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Forgot your password?
              </h2>
              <p className="text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  loading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-yellow-600 hover:text-yellow-500 font-medium text-sm"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;