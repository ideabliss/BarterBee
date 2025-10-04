import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Button, Input } from '../components/UI';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Tell us about yourself' },
    { number: 2, title: 'Contact', description: 'How can we reach you?' },
    { number: 3, title: 'Welcome', description: 'You\'re all set!' }
  ];

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

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (currentStep === 2) {
      if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }
    
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Replace with actual API call to backend
    // Example: const response = await authAPI.register(formData);
    setIsLoading(false);
    setStep(3); // Welcome step
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((stepItem, index) => (
        <React.Fragment key={stepItem.number}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              stepItem.number <= step 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {stepItem.number < step ? (
                <CheckCircleIcon className="h-6 w-6" />
              ) : (
                stepItem.number
              )}
            </div>
            <div className="text-xs mt-2 text-center max-w-20">
              <div className={`font-medium ${stepItem.number <= step ? 'text-yellow-600' : 'text-gray-500'}`}>
                {stepItem.title}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-4 ${
              stepItem.number < step ? 'bg-yellow-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-gray-600 mt-2">Join the BarterBee community</p>
      </div>

      <div className="space-y-5">
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={<UserIcon className="h-5 w-5 text-gray-400" />}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
        />

        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <Button
        onClick={handleNext}
        variant="primary"
        size="lg"
        className="w-full bg-yellow-500 hover:bg-yellow-600"
      >
        Continue
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
        <p className="text-gray-600 mt-2">Help community members connect with you</p>
      </div>

      <div className="space-y-5">
        <Input
          label="Contact Number"
          name="contact"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.contact}
          onChange={handleChange}
          error={errors.contact}
          icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
        />

        <Input
          label="Address"
          name="address"
          type="text"
          placeholder="Enter your city or area"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Privacy Note</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Your contact info is only shared with confirmed barter partners for coordination.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={() => setStep(1)}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          className="w-full bg-yellow-500 hover:bg-yellow-600"
          loading={isLoading}
        >
          Create Account
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircleIcon className="h-12 w-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BarterBee! 🐝</h2>
        <p className="text-gray-600 text-lg">
          Your account has been created successfully.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-800 mb-3">What's next?</h3>
        <ul className="text-left space-y-2 text-sm text-yellow-700">
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-2 text-yellow-600" />
            Set up your profile with skills and items
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-2 text-yellow-600" />
            Browse the community for barter opportunities
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-2 text-yellow-600" />
            Start your first barter exchange
          </li>
        </ul>
      </div>

      <p className="text-sm text-gray-500">
        Redirecting to your dashboard...
      </p>
    </div>
  );

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
              <h1 className="text-4xl font-bold mb-4">Join the Community 🐝</h1>
              <p className="text-xl text-yellow-100 leading-relaxed max-w-md">
                Connect with neighbors and start building meaningful relationships through bartering.
              </p>
            </div>
            
            {/* Community stats */}
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">2,500+</h3>
                    <p className="text-sm text-yellow-100">Active Members</p>
                  </div>
                  <div className="text-2xl">👥</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">15,000+</h3>
                    <p className="text-sm text-yellow-100">Successful Barters</p>
                  </div>
                  <div className="text-2xl">🤝</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">500+</h3>
                    <p className="text-sm text-yellow-100">Skills Shared</p>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-5 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Right Side - Registration Form */}
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

            {/* Header for mobile */}
            <div className="lg:hidden text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-400 text-white p-3 rounded-2xl">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            {step < 3 && renderStepIndicator()}

            {/* Form Container */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              
              {step < 3 && (
                <div className="mt-8 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-yellow-600 hover:text-yellow-500">
                    Sign in here
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;