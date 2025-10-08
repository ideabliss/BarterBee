const { supabase } = require('../config/supabase');

const sessionController = {
  // Create session
  createSession: async (req, res) => {
    try {
      const { barter_request_id, scheduled_date, scheduled_time, duration_minutes, session_notes } = req.body;
      
      // Get barter request to check number_of_sessions
      const { data: barterRequest, error: requestError } = await supabase
        .from('barter_requests')
        .select('number_of_sessions')
        .eq('id', barter_request_id)
        .single();
      
      if (requestError) {
        return res.status(400).json({ error: 'Barter request not found' });
      }
      
      // Count existing sessions
      const { data: existingSessions, error: countError } = await supabase
        .from('sessions')
        .select('id')
        .eq('barter_request_id', barter_request_id);
      
      if (countError) {
        return res.status(400).json({ error: countError.message });
      }
      
      const sessionCount = existingSessions?.length || 0;
      const maxSessions = barterRequest.number_of_sessions || 1;
      
      if (sessionCount >= maxSessions) {
        return res.status(400).json({ error: 'Maximum sessions reached for this barter request' });
      }
      
      const { data: session, error } = await supabase
        .from('sessions')
        .insert([{
          barter_request_id,
          scheduled_date,
          scheduled_time,
          duration_minutes,
          session_notes,
          video_room_id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }])
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Update barter request status
      await supabase
        .from('barter_requests')
        .update({ status: 'scheduled' })
        .eq('id', barter_request_id);
      
      res.status(201).json({ message: 'Session scheduled successfully', session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's sessions
  getUserSessions: async (req, res) => {
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
        .order('scheduled_date', { ascending: true });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ sessions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get session history for a barter request
  getSessionHistory: async (req, res) => {
    try {
      const { barter_request_id } = req.params;
      
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('barter_request_id', barter_request_id)
        .order('scheduled_date', { ascending: true });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Get barter request details
      const { data: barterRequest, error: requestError } = await supabase
        .from('barter_requests')
        .select('number_of_sessions')
        .eq('id', barter_request_id)
        .single();
      
      if (requestError) {
        return res.status(400).json({ error: 'Barter request not found' });
      }
      
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const totalSessions = barterRequest.number_of_sessions || 1;
      const canScheduleNext = completedSessions < totalSessions;
      
      res.json({ 
        sessions, 
        completedSessions, 
        totalSessions, 
        canScheduleNext 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update session
  updateSession: async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduled_date, scheduled_time, duration_minutes, session_notes, status } = req.body;
      
      const { data: session, error } = await supabase
        .from('sessions')
        .update({
          scheduled_date,
          scheduled_time,
          duration_minutes,
          session_notes,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'Session updated successfully', session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Reschedule session
  rescheduleSession: async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduled_date, scheduled_time, reschedule_reason } = req.body;
      
      console.log('Rescheduling session:', { id, scheduled_date, scheduled_time, reschedule_reason });
      
      const updateData = {
        scheduled_date,
        scheduled_time,
        status: 'scheduled', // Keep as scheduled, not rescheduled
        updated_at: new Date().toISOString()
      };
      
      // Add reschedule reason to session notes if provided
      if (reschedule_reason) {
        updateData.reschedule_reason = reschedule_reason;
      }
      
      const { data: session, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase reschedule error:', error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log('Session rescheduled successfully:', session);
      res.json({ message: 'Session rescheduled successfully', session });
    } catch (error) {
      console.error('Reschedule controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Schedule session (alias for createSession)
  scheduleSession: async (req, res) => {
    return sessionController.createSession(req, res);
  },

  // Update session status
  updateSessionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      console.log('Updating session status:', { id, status });
      
      const { data: session, error } = await supabase
        .from('sessions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase status update error:', error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log('Session status updated successfully:', session);
      res.json({ message: 'Session status updated successfully', session });
    } catch (error) {
      console.error('Status update controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Join session
  joinSession: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Update session status to ongoing
      await supabase
        .from('sessions')
        .update({ status: 'ongoing' })
        .eq('id', id);
      
      res.json({ 
        message: 'Joining session',
        video_room_id: session.video_room_id,
        session_details: session
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Complete session
  completeSession: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data: session, error } = await supabase
        .from('sessions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('barter_request_id')
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Check if all sessions are completed
      const { data: allSessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('status')
        .eq('barter_request_id', session.barter_request_id);
      
      const { data: barterRequest, error: requestError } = await supabase
        .from('barter_requests')
        .select('number_of_sessions')
        .eq('id', session.barter_request_id)
        .single();
      
      if (!sessionsError && !requestError) {
        const completedCount = allSessions.filter(s => s.status === 'completed').length;
        const totalSessions = barterRequest.number_of_sessions || 1;
        
        if (completedCount >= totalSessions) {
          // All sessions completed, update barter request status
          await supabase
            .from('barter_requests')
            .update({ status: 'completed' })
            .eq('id', session.barter_request_id);
        }
      }
      
      res.json({ message: 'Session completed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = sessionController;