const { supabase } = require('../config/supabase');

const itemController = {
  // Get all items (for search)
  getAllItems: async (req, res) => {
    try {
      const { search, category } = req.query;
      
      let query = supabase
        .from('items')
        .select(`
          *,
          users:user_id (
            id, name, username, profile_picture, average_rating
          )
        `)
        .eq('is_available', true)
        .neq('user_id', req.userId);
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data: items, error } = await query;
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ items });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's items
  getUserItems: async (req, res) => {
    try {
      const { data: items, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', req.userId);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ items });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add new item
  createItem: async (req, res) => {
    try {
      const { name, description, category, image, condition_rating } = req.body;
      
      const { data: item, error } = await supabase
        .from('items')
        .insert([{
          user_id: req.userId,
          name,
          description,
          category,
          image,
          condition_rating
        }])
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(201).json({ message: 'Item added successfully', item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update item
  updateItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category, image, condition_rating, is_available } = req.body;
      
      const { data: item, error } = await supabase
        .from('items')
        .update({
          name,
          description,
          category,
          image,
          condition_rating,
          is_available,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', req.userId)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'Item updated successfully', item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete item
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', req.userId);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = itemController;