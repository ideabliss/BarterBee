const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const { createTables } = require('./config/database');
const { supabase } = require('./config/supabase');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://barter-bee-c6dl.vercel.app',
    'https://barter-bee-c6dl-pnmxlr8uw-parth-chavans-projects-b0e79f41.vercel.app',
    'https://barter-bee-smoky.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📨 [${timestamp}] ${req.method} ${req.path}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📝 Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('🔍 Query Params:', req.query);
  }
  
  if (req.headers.authorization) {
    console.log('🔑 Auth Header: Bearer ***');
  }
  
  // Capture original res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    console.log(`📤 [${timestamp}] Response ${res.statusCode}:`, JSON.stringify(data, null, 2));
    return originalJson.call(this, data);
  };
  
  next();
});

// Initialize database on startup
const initializeApp = async () => {
  try {
    console.log('🔧 Initializing BarterBee Backend...');
    await createTables();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
};

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'BarterBee API is running!', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      skills: '/api/skills',
      items: '/api/items',
      polls: '/api/polls',
      barter: '/api/barter',
      sessions: '/api/sessions',
      messages: '/api/messages',
      reviews: '/api/reviews',
      tracking: '/api/tracking',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard'
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    res.json({ 
      status: 'healthy', 
      database: error ? 'disconnected' : 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// API Routes
app.use('/api/auth', require('./Route/authRoutes'));
app.use('/api/users', require('./Route/userRoutes'));
app.use('/api/skills', require('./Route/skillRoutes'));
app.use('/api/items', require('./Route/itemRoutes'));
app.use('/api/polls', require('./Route/pollRoutes'));
app.use('/api/barter', require('./Route/barterRoutes'));
app.use('/api/sessions', require('./Route/sessionRoutes'));
app.use('/api/messages', require('./Route/messageRoutes'));
app.use('/api/reviews', require('./Route/reviewRoutes'));
app.use('/api/tracking', require('./Route/trackingRoutes'));
app.use('/api/notifications', require('./Route/notificationRoutes'));
app.use('/api/dashboard', require('./Route/dashboardRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize Socket.IO
initializeSocket(server);

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💬 Socket.IO enabled for real-time chat`);
  await initializeApp();
});

module.exports = app;