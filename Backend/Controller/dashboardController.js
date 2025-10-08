const { supabase } = require('../config/supabase');

const dashboardController = {
  // Get dashboard stats
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
      
      // Get user points
      const { data: user } = await supabase
        .from('users')
        .select('points')
        .eq('id', req.userId)
        .single();
      
      // Get pending requests
      const { count: pendingRequests } = await supabase
        .from('barter_requests')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', req.userId)
        .eq('status', 'pending');
      
      // Get active sessions
      const { count: activeSessions } = await supabase
        .from('sessions')
        .select('*, barter_requests!inner(*)', { count: 'exact', head: true })
        .or(`barter_requests.from_user_id.eq.${req.userId},barter_requests.to_user_id.eq.${req.userId}`)
        .in('status', ['scheduled', 'ongoing']);
      
      res.json({
        stats: {
          skillsOffered: skillsCount || 0,
          itemsAvailable: itemsCount || 0,
          opinionPoints: user?.points || 0,
          pendingRequests: pendingRequests || 0,
          activeSessions: activeSessions || 0
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get recent activity
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
          from_item:from_item_id (name),
          to_item:to_item_id (name),
          sessions (id, scheduled_date, scheduled_time, status)
        `)
        .or(`from_user_id.eq.${req.userId},to_user_id.eq.${req.userId}`)
        .neq('status', 'pending')
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ activities });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get upcoming sessions
  getUpcomingSessions: async (req, res) => {
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          *,
          barter_requests:barter_request_id (
            *,
            from_user:from_user_id (id, name, profile_picture),
            to_user:to_user_id (id, name, profile_picture),
            from_skill:from_skill_id (name),
            to_skill:to_skill_id (name)
          )
        `)
        .or(`barter_requests.from_user_id.eq.${req.userId},barter_requests.to_user_id.eq.${req.userId}`)
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .limit(5);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ sessions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = dashboardController;