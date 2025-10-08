const { supabaseAdmin } = require('./supabase');

const createTables = async () => {
  try {
    console.log('🚀 Starting database setup...');
    
    // Check if tables exist by trying to query them
    const checkTable = async (tableName) => {
      try {
        const { error } = await supabaseAdmin.from(tableName).select('*').limit(1);
        return !error;
      } catch {
        return false;
      }
    };
    
    // Create tables using Supabase client methods
    const tables = [
      {
        name: 'users',
        check: () => checkTable('users')
      },
      {
        name: 'skill_categories', 
        check: () => checkTable('skill_categories')
      },
      {
        name: 'skills',
        check: () => checkTable('skills')
      },
      {
        name: 'items',
        check: () => checkTable('items')
      },
      {
        name: 'barter_requests',
        check: () => checkTable('barter_requests')
      },
      {
        name: 'sessions',
        check: () => checkTable('sessions')
      },
      {
        name: 'messages',
        check: () => checkTable('messages')
      },
      {
        name: 'notifications',
        check: () => checkTable('notifications')
      }
    ];
    
    let existingTables = 0;
    
    for (const table of tables) {
      const exists = await table.check();
      if (exists) {
        console.log(`✅ Table '${table.name}' already exists`);
        existingTables++;
      } else {
        console.log(`❌ Table '${table.name}' does not exist`);
      }
    }
    
    if (existingTables === tables.length) {
      console.log('🎉 All tables already exist!');
    } else {
      console.log('⚠️  Some tables are missing. Please create them manually in Supabase dashboard.');
      console.log('📋 Use the SQL schema from database_schema.sql file');
    }
    
    // Try to insert default categories if skill_categories table exists
    const skillCategoriesExist = await checkTable('skill_categories');
    if (skillCategoriesExist) {
      const defaultCategories = [
        { name: 'Culinary', description: 'Cooking and food-related skills' },
        { name: 'Music', description: 'Musical instruments and composition' },
        { name: 'Technology', description: 'Programming and technical skills' },
        { name: 'Creative', description: 'Art, design, and creative skills' }
      ];
      
      for (const category of defaultCategories) {
        const { error } = await supabaseAdmin
          .from('skill_categories')
          .upsert(category, { onConflict: 'name' });
        
        if (!error) {
          console.log(`✅ Category '${category.name}' added`);
        }
      }
    }
    
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('💥 Database setup failed:', error);
  }
};

// Manual table creation SQL (for reference)
const getCreateTableSQL = () => {
  return `
-- Copy and paste this SQL into your Supabase SQL editor:

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(20),
  address TEXT,
  postal_address TEXT,
  profile_picture VARCHAR(255),
  points INTEGER DEFAULT 0,
  total_skill_sessions INTEGER DEFAULT 0,
  total_item_exchanges INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  image VARCHAR(255),
  skill_level VARCHAR(20) DEFAULT 'intermediate',
  years_experience INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  image VARCHAR(255),
  is_available BOOLEAN DEFAULT true,
  condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS barter_requests (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('skill', 'item', 'opinion')),
  from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  from_skill_id INTEGER REFERENCES skills(id),
  to_skill_id INTEGER REFERENCES skills(id),
  from_item_id INTEGER REFERENCES items(id),
  to_item_id INTEGER REFERENCES items(id),
  barter_period INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  response_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
  scheduled_date DATE,
  scheduled_time TIME,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(20) DEFAULT 'scheduled',
  session_notes TEXT,
  video_room_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(255),
  related_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `;
};

module.exports = { createTables, getCreateTableSQL };