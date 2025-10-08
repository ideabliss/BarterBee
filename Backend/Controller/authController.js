const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { supabase } = require('../config/supabase');

const authController = {
  // Register user
  register: async (req, res) => {
    try {
      const { username, email, password, name, contact, address } = req.body;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username,
          email,
          password_hash: hashedPassword,
          name,
          contact,
          address
        }])
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Generate JWT
      const token = jwt.sign(
        { userId: data.id, email: data.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: data.id,
          username: data.username,
          email: data.email,
          name: data.name
        }
      });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          points: user.points
        }
      });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !user) {
        return res.json({ message: 'If email exists, reset link has been sent' });
      }
      
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);
      
      await supabase
        .from('users')
        .update({
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString()
        })
        .eq('id', user.id);
      
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      res.json({ message: 'If email exists, reset link has been sent' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('reset_token', token)
        .single();
      
      if (error || !user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      if (new Date() > new Date(user.reset_token_expiry)) {
        return res.status(400).json({ error: 'Reset token has expired' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await supabase
        .from('users')
        .update({
          password_hash: hashedPassword,
          reset_token: null,
          reset_token_expiry: null
        })
        .eq('id', user.id);
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Change password (authenticated user)
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.userId)
        .single();
      
      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', user.id);
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;