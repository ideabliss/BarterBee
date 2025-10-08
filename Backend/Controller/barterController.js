const { supabase } = require('../config/supabase');

const barterController = {
  // Create barter request
  createRequest: async (req, res) => {
    try {
      const { type, to_user_id, from_skill_id, to_skill_id, from_item_id, to_item_id, message, barter_period, shipping_method, preferred_date, number_of_sessions } = req.body;
      
      console.log('Creating barter request:', {
        type,
        from_user_id: req.userId,
        to_user_id,
        from_skill_id,
        to_skill_id,
        from_item_id,
        to_item_id,
        message,
        barter_period,
        shipping_method,
        preferred_date,
        number_of_sessions
      });
      
      const insertData = {
        type,
        from_user_id: req.userId,
        to_user_id,
        message
      };
      
      // Add skill-specific fields
      if (from_skill_id) insertData.from_skill_id = from_skill_id;
      if (to_skill_id) insertData.to_skill_id = to_skill_id;
      
      // Add item-specific fields
      if (from_item_id) insertData.from_item_id = from_item_id;
      if (to_item_id) insertData.to_item_id = to_item_id;
      if (barter_period) insertData.barter_period = barter_period;
      if (shipping_method) insertData.shipping_method = shipping_method;
      
      // Add skill-specific fields
      if (number_of_sessions) insertData.number_of_sessions = number_of_sessions;
      
      const { data: request, error } = await supabase
        .from('barter_requests')
        .insert([insertData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json({ message: 'Barter request sent successfully', request });
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's barter requests
  getRequests: async (req, res) => {
    try {
      const { data: requests, error } = await supabase
        .from('barter_requests')
        .select(`
          *,
          from_user:from_user_id (id, name, username, profile_picture),
          to_user:to_user_id (id, name, username, profile_picture),
          from_skill:from_skill_id (id, name, description),
          to_skill:to_skill_id (id, name, description),
          from_item:from_item_id (id, name, description),
          to_item:to_item_id (id, name, description)
        `)
        .or(`from_user_id.eq.${req.userId},to_user_id.eq.${req.userId}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ requests });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update barter request status
  updateRequestStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, response_message } = req.body;
      
      console.log('Updating barter request:', { id, status, userId: req.userId });
      
      const { data: request, error } = await supabase
        .from('barter_requests')
        .update({
          status,
          response_message,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .or(`to_user_id.eq.${req.userId},from_user_id.eq.${req.userId}`)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'Request updated successfully', request });
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user activity
  getActivity: async (req, res) => {
    try {
      const { data: activities, error } = await supabase
        .from('barter_requests')
        .select(`
          *,
          from_user:from_user_id (id, name, profile_picture),
          to_user:to_user_id (id, name, profile_picture),
          from_skill:from_skill_id (name),
          to_skill:to_skill_id (name),
          sessions (id, scheduled_date, scheduled_time, status)
        `)
        .or(`from_user_id.eq.${req.userId},to_user_id.eq.${req.userId}`)
        .neq('status', 'pending')
        .order('updated_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ activities });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = barterController;