const { supabase } = require('../config/supabase');

const notificationController = {
  // Get user notifications
  getNotifications: async (req, res) => {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', req.userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ notifications });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', req.userId);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', req.userId)
        .eq('is_read', false);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get unread count
  getUnreadCount: async (req, res) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId)
        .eq('is_read', false);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ unread_count: count || 0 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = notificationController;