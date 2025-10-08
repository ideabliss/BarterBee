const { supabase } = require('../config/supabase');

const messageController = {
  // Get messages for a barter request
  getMessages: async (req, res) => {
    try {
      const { barter_request_id } = req.params;
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (id, name, profile_picture),
          receiver:receiver_id (id, name, profile_picture)
        `)
        .eq('barter_request_id', barter_request_id)
        .order('created_at', { ascending: true });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Mark messages as read for current user
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('barter_request_id', barter_request_id)
        .eq('receiver_id', req.userId);
      
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Send message
  sendMessage: async (req, res) => {
    try {
      const { barter_request_id, receiver_id, message_text } = req.body;
      
      const { data: message, error } = await supabase
        .from('messages')
        .insert([{
          barter_request_id,
          sender_id: req.userId,
          receiver_id,
          message_text
        }])
        .select(`
          *,
          sender:sender_id (id, name, profile_picture),
          receiver:receiver_id (id, name, profile_picture)
        `)
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Create notification for receiver
      await supabase
        .from('notifications')
        .insert([{
          user_id: receiver_id,
          type: 'new_message',
          title: 'New Message',
          message: `You have a new message from ${message.sender.name}`,
          related_id: barter_request_id
        }]);
      
      res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get unread message count
  getUnreadCount: async (req, res) => {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', req.userId)
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

module.exports = messageController;