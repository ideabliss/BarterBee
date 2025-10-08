const { supabase } = require('../config/supabase');

const pollController = {
  // Get all polls (for voting)
  getAllPolls: async (req, res) => {
    try {
      const { data: polls, error } = await supabase
        .from('polls')
        .select(`
          *,
          users:user_id (
            id, name, username, profile_picture
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Check if user has voted on each poll
      if (req.userId) {
        const { data: userVotes } = await supabase
          .from('poll_votes')
          .select('poll_id')
          .eq('user_id', req.userId);
        
        const votedPollIds = new Set(userVotes?.map(v => v.poll_id) || []);
        
        polls.forEach(poll => {
          poll.user_voted = votedPollIds.has(poll.id);
          poll.options = JSON.parse(poll.options || '[]');
          poll.votes = JSON.parse(poll.votes || '[]');
        });
      } else {
        polls.forEach(poll => {
          poll.user_voted = false;
          poll.options = JSON.parse(poll.options || '[]');
          poll.votes = JSON.parse(poll.votes || '[]');
        });
      }
      
      res.json({ polls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's polls
  getUserPolls: async (req, res) => {
    try {
      const { data: polls, error } = await supabase
        .from('polls')
        .select('*')
        .eq('user_id', req.userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Parse JSON fields
      polls.forEach(poll => {
        poll.options = JSON.parse(poll.options || '[]');
        poll.votes = JSON.parse(poll.votes || '[]');
      });
      
      res.json({ polls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new poll
  createPoll: async (req, res) => {
    try {
      const { question, type, options, points_cost = 0 } = req.body;
      
      // Create poll without points check
      const { data: poll, error } = await supabase
        .from('polls')
        .insert([{
          user_id: req.userId,
          question,
          type,
          options: JSON.stringify(options),
          points_cost,
          votes: JSON.stringify(new Array(options.length).fill(0))
        }])
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json({ message: 'Poll created successfully', poll });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Vote on poll
  voteOnPoll: async (req, res) => {
    try {
      const { id } = req.params;
      const { option_index } = req.body;
      
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', id)
        .eq('user_id', req.userId)
        .single();
      
      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted on this poll' });
      }
      
      // Get current poll data
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single();
      
      if (pollError) {
        return res.status(404).json({ error: 'Poll not found' });
      }
      
      // Update vote count
      const votes = JSON.parse(poll.votes);
      votes[option_index] = (votes[option_index] || 0) + 1;
      
      // Update poll
      await supabase
        .from('polls')
        .update({
          votes: JSON.stringify(votes),
          total_votes: poll.total_votes + 1
        })
        .eq('id', id);
      
      // Record user vote
      await supabase
        .from('poll_votes')
        .insert([{
          poll_id: id,
          user_id: req.userId,
          option_index
        }]);
      
      // Give user points for voting
      const { data: user } = await supabase
        .from('users')
        .select('points')
        .eq('id', req.userId)
        .single();
      
      await supabase
        .from('users')
        .update({ points: user.points + 1 })
        .eq('id', req.userId);
      
      res.json({ message: 'Vote recorded successfully', points_earned: 1 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = pollController;