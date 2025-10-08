-- BarterBee Database Setup for Supabase
-- Copy and paste this SQL into your Supabase SQL editor

-- Users table
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

-- Skill categories
CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
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

-- Items table
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

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('text', 'image')),
  options JSON NOT NULL,
  votes JSON DEFAULT '[]',
  total_votes INTEGER DEFAULT 0,
  points_cost INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Barter requests
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
  number_of_sessions INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  response_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
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

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
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

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  teaching_quality INTEGER CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  review_text TEXT,
  would_recommend BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default skill categories
INSERT INTO skill_categories (name, description) VALUES 
('Culinary', 'Cooking and food-related skills'),
('Music', 'Musical instruments and composition'),
('Technology', 'Programming and technical skills'),
('Creative', 'Art, design, and creative skills'),
('Language', 'Language learning and translation'),
('Fitness', 'Sports and physical activities'),
('Academic', 'Educational and tutoring skills')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_barter_requests_from_user ON barter_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_barter_requests_to_user ON barter_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_barter_request ON messages(barter_request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);