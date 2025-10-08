const { supabase } = require('../config/supabase');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, email, name, contact, address, profile_picture, points, total_skill_sessions, total_item_exchanges, average_rating')
        .eq('id', req.userId)
        .single();
      
      if (error) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { name, contact, address, profile_picture } = req.body;
      
      const { data, error } = await supabase
        .from('users')
        .update({ name, contact, address, profile_picture, updated_at: new Date().toISOString() })
        .eq('id', req.userId)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'Profile updated successfully', user: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user stats
  getStats: async (req, res) => {
    try {
      // Get skills count
      const { count: skillsCount } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId)
        .eq('is_active', true);
      
      // Get items count
      const { count: itemsCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId)
        .eq('is_available', true);
      
      // Get pending requests
      const { count: pendingRequests } = await supabase
        .from('barter_requests')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', req.userId)
        .eq('status', 'pending');
      
      res.json({
        stats: {
          skillsOffered: skillsCount || 0,
          itemsAvailable: itemsCount || 0,
          pendingRequests: pendingRequests || 0
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;