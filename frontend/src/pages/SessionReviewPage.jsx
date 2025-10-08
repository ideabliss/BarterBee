import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/UI';
import { StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import apiService from '../services/api';

const SessionReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, partnerName, sessionDuration } = location.state || {};
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setLoading(true);
    try {
      await apiService.createReview({
        session_id: sessionId,
        overall_rating: rating,
        review_text: review,
        teaching_quality: rating,
        communication_rating: rating
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipReview = () => {
    navigate('/skills');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your review has been submitted successfully.</p>
          <Button onClick={() => navigate('/skills')} className="w-full">
            Back to Skills
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h1>
          <p className="text-gray-600">How was your session with {partnerName}?</p>
          {sessionDuration && (
            <p className="text-sm text-gray-500 mt-1">Duration: {sessionDuration}</p>
          )}
        </div>

        <form onSubmit={handleSubmitReview} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating
            </label>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  {star <= rating ? (
                    <StarIconSolid className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-1">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this session..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipReview}
              className="flex-1"
              disabled={loading}
            >
              Skip Review
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || rating === 0}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SessionReviewPage;