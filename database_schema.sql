-- BarterBee Complete Database Schema
-- PostgreSQL/MySQL Compatible

-- Users table
CREATE TABLE users (
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

-- Skills table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES skill_categories(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- Keep for backward compatibility
    image VARCHAR(255),
    skill_level VARCHAR(20) DEFAULT 'intermediate' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items/Things table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES item_categories(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- Keep for backward compatibility
    image VARCHAR(255),
    is_available BOOLEAN DEFAULT true,
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    estimated_value DECIMAL(10,2),
    requires_deposit BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2),
    max_barter_days INTEGER DEFAULT 14,
    usage_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Polls/Opinions table
CREATE TABLE polls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('text', 'image')),
    options JSON NOT NULL, -- Array of options with text/image
    votes JSON DEFAULT '[]', -- Array of vote counts
    total_votes INTEGER DEFAULT 0,
    points_cost INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poll votes tracking
CREATE TABLE poll_votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

-- Barter requests table
CREATE TABLE barter_requests (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) CHECK (type IN ('skill', 'item', 'opinion')),
    from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Skill barter fields
    from_skill_id INTEGER REFERENCES skills(id),
    to_skill_id INTEGER REFERENCES skills(id),
    preferred_session_date DATE,
    preferred_session_time TIME,
    preferred_duration INTEGER DEFAULT 60,
    
    -- Item barter fields
    from_item_id INTEGER REFERENCES items(id),
    to_item_id INTEGER REFERENCES items(id),
    barter_period INTEGER, -- days
    shipping_method VARCHAR(50),
    from_postal_address_id INTEGER REFERENCES postal_addresses(id),
    to_postal_address_id INTEGER REFERENCES postal_addresses(id),
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'scheduled', 'ongoing', 'shipped', 'delivered', 'completed', 'cancelled')),
    message TEXT,
    response_message TEXT,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for skill exchanges)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
    scheduled_date DATE,
    scheduled_time TIME,
    scheduled_datetime TIMESTAMP GENERATED ALWAYS AS (scheduled_date + scheduled_time) STORED,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'rescheduled')),
    session_notes TEXT,
    preparation_notes TEXT,
    video_room_id VARCHAR(100),
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    session_number INTEGER DEFAULT 1,
    is_follow_up BOOLEAN DEFAULT false,
    reschedule_reason TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- View for upcoming sessions
CREATE VIEW upcoming_sessions AS
SELECT 
    s.id,
    s.barter_request_id,
    s.scheduled_date,
    s.scheduled_time,
    s.scheduled_datetime,
    s.duration_minutes,
    s.status,
    s.session_notes,
    s.preparation_notes,
    s.video_room_id,
    s.session_number,
    s.is_follow_up,
    br.from_user_id,
    br.to_user_id,
    u1.name as teacher_name,
    u1.profile_picture as teacher_avatar,
    u2.name as learner_name,
    u2.profile_picture as learner_avatar,
    sk1.name as teaching_skill,
    sk2.name as learning_skill,
    EXTRACT(EPOCH FROM (s.scheduled_datetime - NOW()))/3600 as hours_until_session
FROM sessions s
JOIN barter_requests br ON s.barter_request_id = br.id
JOIN users u1 ON br.to_user_id = u1.id
JOIN users u2 ON br.from_user_id = u2.id
JOIN skills sk1 ON br.to_skill_id = sk1.id
JOIN skills sk2 ON br.from_skill_id = sk2.id
WHERE s.status = 'scheduled' 
  AND s.scheduled_datetime > NOW()
ORDER BY s.scheduled_datetime ASC;

-- Tracking information for item exchanges
CREATE TABLE tracking_info (
    id SERIAL PRIMARY KEY,
    barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100),
    return_tracking_number VARCHAR(100),
    
    -- Forward shipping
    package_sent BOOLEAN DEFAULT false,
    package_sent_date TIMESTAMP,
    package_in_transit BOOLEAN DEFAULT false,
    package_delivered BOOLEAN DEFAULT false,
    package_delivered_date TIMESTAMP,
    
    -- Return shipping
    return_sent BOOLEAN DEFAULT false,
    return_sent_date TIMESTAMP,
    return_in_transit BOOLEAN DEFAULT false,
    return_delivered BOOLEAN DEFAULT false,
    return_delivered_date TIMESTAMP,
    
    -- Additional tracking
    shipping_method VARCHAR(50),
    estimated_delivery DATE,
    return_deadline DATE,
    courier_service VARCHAR(50),
    tracking_updates JSON,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
    reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Skill-specific ratings
    teaching_quality INTEGER CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    -- Item-specific ratings
    item_condition INTEGER CHECK (item_condition >= 1 AND item_condition <= 5),
    
    -- General fields
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    review_text TEXT,
    would_recommend BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages/Chat table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(255),
    related_id INTEGER, -- Generic reference to related entity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activity log
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    related_table VARCHAR(50),
    related_id INTEGER,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    session_reminders BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    preferred_session_duration INTEGER DEFAULT 60,
    preferred_barter_period INTEGER DEFAULT 14,
    auto_accept_follow_ups BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill categories for better organization
CREATE TABLE skill_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item categories for better organization
CREATE TABLE item_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    requires_deposit BOOLEAN DEFAULT false,
    max_barter_period INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User connections/following system
CREATE TABLE user_connections (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    connection_type VARCHAR(20) DEFAULT 'follow' CHECK (connection_type IN ('follow', 'block', 'favorite')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);

-- Saved searches for users
CREATE TABLE saved_searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    search_type VARCHAR(20) CHECK (search_type IN ('skill', 'item')),
    search_query VARCHAR(255),
    filters JSON,
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings and configurations
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dispute resolution system
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
    reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reported_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    dispute_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- File attachments for various entities
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video session rooms for skill exchanges
CREATE TABLE video_rooms (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    room_token VARCHAR(255) UNIQUE NOT NULL,
    room_url VARCHAR(500),
    max_participants INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    recording_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard statistics cache
CREATE TABLE user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    skills_offered INTEGER DEFAULT 0,
    items_available INTEGER DEFAULT 0,
    opinion_points INTEGER DEFAULT 0,
    pending_requests INTEGER DEFAULT 0,
    active_sessions INTEGER DEFAULT 0,
    completed_exchanges INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search filters and preferences
CREATE TABLE search_filters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filter_type VARCHAR(20) CHECK (filter_type IN ('skill', 'item')),
    category_filters JSON,
    location_filters JSON,
    rating_filter INTEGER,
    availability_filter BOOLEAN,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Postal addresses for item exchanges
CREATE TABLE postal_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'primary' CHECK (address_type IN ('primary', 'secondary', 'temporary')),
    full_address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session feedback and notes
CREATE TABLE session_feedback (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) CHECK (feedback_type IN ('pre_session', 'post_session', 'follow_up')),
    notes TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    technical_issues TEXT,
    suggestions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item condition reports
CREATE TABLE item_condition_reports (
    id SERIAL PRIMARY KEY,
    barter_request_id INTEGER REFERENCES barter_requests(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(20) CHECK (report_type IN ('pre_exchange', 'post_exchange', 'damage_report')),
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    condition_notes TEXT,
    damage_description TEXT,
    photos JSON, -- Array of photo URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quick actions and shortcuts
CREATE TABLE quick_actions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    action_data JSON,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences by type
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly', 'never')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

-- Enhanced indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_is_active ON skills(is_active);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_is_available ON items(is_available);
CREATE INDEX idx_polls_user_id ON polls(user_id);
CREATE INDEX idx_polls_is_active ON polls(is_active);
CREATE INDEX idx_barter_requests_from_user ON barter_requests(from_user_id);
CREATE INDEX idx_barter_requests_to_user ON barter_requests(to_user_id);
CREATE INDEX idx_barter_requests_status ON barter_requests(status);
CREATE INDEX idx_barter_requests_type ON barter_requests(type);
CREATE INDEX idx_sessions_barter_request ON sessions(barter_request_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX idx_sessions_scheduled_datetime ON sessions(scheduled_datetime);
CREATE INDEX idx_sessions_upcoming ON sessions(scheduled_datetime) WHERE status = 'scheduled' AND scheduled_datetime > NOW();
CREATE INDEX idx_tracking_info_barter_request ON tracking_info(barter_request_id);
CREATE INDEX idx_messages_barter_request ON messages(barter_request_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_reviews_barter_request ON reviews(barter_request_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_user_connections_follower ON user_connections(follower_id);
CREATE INDEX idx_user_connections_following ON user_connections(following_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_video_rooms_session ON video_rooms(session_id);
CREATE INDEX idx_postal_addresses_user ON postal_addresses(user_id);
CREATE INDEX idx_session_feedback_session ON session_feedback(session_id);
CREATE INDEX idx_item_condition_reports_barter ON item_condition_reports(barter_request_id);
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

-- Insert default categories
INSERT INTO skill_categories (name, description) VALUES 
('Culinary', 'Cooking and food-related skills'),
('Music', 'Musical instruments and composition'),
('Technology', 'Programming and technical skills'),
('Creative', 'Art, design, and creative skills'),
('Language', 'Language learning and translation'),
('Fitness', 'Sports and physical activities'),
('Academic', 'Educational and tutoring skills');

INSERT INTO item_categories (name, description, max_barter_period) VALUES 
('Books', 'Literature and educational books', 21),
('Electronics', 'Electronic devices and gadgets', 14),
('Instruments', 'Musical instruments', 30),
('Tools', 'Hand tools and equipment', 14),
('Art Supplies', 'Creative and artistic materials', 21),
('Sports Equipment', 'Sports and fitness gear', 14),
('Kitchen Items', 'Cooking and kitchen utensils', 7);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('max_session_duration', '180', 'Maximum session duration in minutes'),
('max_barter_period', '60', 'Maximum barter period in days'),
('points_per_poll_answer', '1', 'Points earned per poll answer'),
('points_required_poll_creation', '3', 'Points required to create a poll'),
('session_reminder_hours', '2', 'Hours before session to send reminder'),
('auto_complete_days', '7', 'Days after return to auto-complete exchange'),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes'),
('video_session_timeout', '7200', 'Video session timeout in seconds');sts(status);
CREATE INDEX idx_barter_requests_type ON barter_requests(type);
CREATE INDEX idx_sessions_barter_request ON sessions(barter_request_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX idx_sessions_scheduled_datetime ON sessions(scheduled_datetime);
CREATE INDEX idx_sessions_upcoming ON sessions(scheduled_datetime) WHERE status = 'scheduled' AND scheduled_datetime > NOW();
CREATE INDEX idx_tracking_info_barter_request ON tracking_info(barter_request_id);
CREATE INDEX idx_messages_barter_request ON messages(barter_request_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_reviews_barter_request ON reviews(barter_request_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_user_connections_follower ON user_connections(follower_id);
CREATE INDEX idx_user_connections_following ON user_connections(following_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- Insert default categories
INSERT INTO skill_categories (name, description) VALUES 
('Culinary', 'Cooking and food-related skills'),
('Music', 'Musical instruments and composition'),
('Technology', 'Programming and technical skills'),
('Creative', 'Art, design, and creative skills'),
('Language', 'Language learning and translation'),
('Fitness', 'Sports and physical activities'),
('Academic', 'Educational and tutoring skills');

INSERT INTO item_categories (name, description, max_barter_period) VALUES 
('Books', 'Literature and educational books', 21),
('Electronics', 'Electronic devices and gadgets', 14),
('Instruments', 'Musical instruments', 30),
('Tools', 'Hand tools and equipment', 14),
('Art Supplies', 'Creative and artistic materials', 21),
('Sports Equipment', 'Sports and fitness gear', 14),
('Kitchen Items', 'Cooking and kitchen utensils', 7);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('max_session_duration', '180', 'Maximum session duration in minutes'),
('max_barter_period', '60', 'Maximum barter period in days'),
('points_per_poll_answer', '1', 'Points earned per poll answer'),
('points_required_poll_creation', '3', 'Points required to create a poll'),
('session_reminder_hours', '2', 'Hours before session to send reminder'),
('auto_complete_days', '7', 'Days after return to auto-complete exchange');
