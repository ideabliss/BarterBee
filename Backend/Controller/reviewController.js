const { supabase } = require('../config/supabase');

const reviewController = {
  // Create review
  createReview: async (req, res) => {
    try {
      const { 
        barter_request_id, 
        reviewee_id, 
        teaching_quality, 
        communication_rating, 
        overall_rating, 
        review_text, 
        would_recommend 
      } = req.body;
      
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('*')
        .eq('barter_request_id', barter_request_id)
        .eq('reviewer_id', req.userId)
        .single();
      
      if (existingReview) {
        return res.status(400).json({ error: 'Review already submitted for this exchange' });
      }
      
      const { data: review, error } = await supabase
        .from('reviews')
        .insert([{
          barter_request_id,
          reviewer_id: req.userId,
          reviewee_id,
          teaching_quality,
          communication_rating,
          overall_rating,
          review_text,
          would_recommend
        }])
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Update reviewee's average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('overall_rating')
        .eq('reviewee_id', reviewee_id);
      
      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length;
        
        await supabase
          .from('users')
          .update({ average_rating: avgRating.toFixed(2) })
          .eq('id', reviewee_id);
      }
      
      res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get reviews for a user
  getUserReviews: async (req, res) => {
    try {
      const { user_id } = req.params;
      
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (id, name, profile_picture),
          barter_requests:barter_request_id (
            type,
            from_skill:from_skill_id (name),
            to_skill:to_skill_id (name)
          )
        `)
        .eq('reviewee_id', user_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ reviews });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get review for specific barter request
  getBarterReview: async (req, res) => {
    try {
      const { barter_request_id } = req.params;
      
      const { data: review, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (id, name, profile_picture),
          reviewee:reviewee_id (id, name, profile_picture)
        `)
        .eq('barter_request_id', barter_request_id)
        .eq('reviewer_id', req.userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ review: review || null });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reviewController;