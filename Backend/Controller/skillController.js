const { supabase } = require('../config/supabase');

const skillController = {
  // Get all skills (for search)
  getAllSkills: async (req, res) => {
    try {
      const { search, category } = req.query;
      
      let query = supabase
        .from('skills')
        .select(`
          *,
          users:user_id (
            id, name, username, profile_picture, average_rating
          )
        `)
        .eq('is_active', true)
        .neq('user_id', req.userId);
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data: skills, error } = await query;
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ skills });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's skills
  getUserSkills: async (req, res) => {
    try {
      const { data: skills, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', req.userId)
        .eq('is_active', true);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ skills });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add new skill
  createSkill: async (req, res) => {
    try {
      const { name, description, category, image, skill_level, years_experience } = req.body;
      
      const { data: skill, error } = await supabase
        .from('skills')
        .insert([{
          user_id: req.userId,
          name,
          description,
          category,
          image,
          skill_level,
          years_experience
        }])
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json({ message: 'Skill added successfully', skill });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update skill
  updateSkill: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category, image, skill_level, years_experience } = req.body;
      
      const { data: skill, error } = await supabase
        .from('skills')
        .update({
          name,
          description,
          category,
          image,
          skill_level,
          years_experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', req.userId)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'Skill updated successfully', skill });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete skill
  deleteSkill: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { error } = await supabase
        .from('skills')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', req.userId);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = skillController;