-- Insert dummy users with Indian names
INSERT INTO users (username, email, password_hash, name, contact, address, profile_picture, points) VALUES
('priya_sharma', 'priya.sharma@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Sharma', '+91-9876543210', 'Connaught Place, New Delhi', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 15),
('arjun_patel', 'arjun.patel@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Arjun Patel', '+91-9876543211', 'Bandra West, Mumbai', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 8),
('kavya_reddy', 'kavya.reddy@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kavya Reddy', '+91-9876543212', 'Koramangala, Bangalore', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 22),
('rohit_singh', 'rohit.singh@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rohit Singh', '+91-9876543213', 'Sector 17, Chandigarh', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 12),
('ananya_gupta', 'ananya.gupta@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ananya Gupta', '+91-9876543214', 'Park Street, Kolkata', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 18),
('vikram_joshi', 'vikram.joshi@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Vikram Joshi', '+91-9876543215', 'Aundh, Pune', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 25),
('meera_nair', 'meera.nair@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Meera Nair', '+91-9876543216', 'Marine Drive, Kochi', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', 9),
('aditya_kumar', 'aditya.kumar@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aditya Kumar', '+91-9876543217', 'Rajouri Garden, New Delhi', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', 14),
('shreya_iyer', 'shreya.iyer@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Shreya Iyer', '+91-9876543218', 'Anna Nagar, Chennai', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', 31),
('karan_malhotra', 'karan.malhotra@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Karan Malhotra', '+91-9876543219', 'Cyber City, Gurgaon', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', 7);

-- Insert skills
INSERT INTO skills (user_id, name, description, category, image, skill_level, years_experience) VALUES
(1, 'Indian Classical Dance', 'Teaching Bharatanatyam and Kathak with 8 years of experience', 'Arts & Culture', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', 'advanced', 8),
(1, 'Hindi Language', 'Native Hindi speaker, can teach conversational and written Hindi', 'Languages', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', 'expert', 15),
(2, 'Guitar Playing', 'Acoustic and electric guitar lessons for beginners to intermediate', 'Music', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop', 'intermediate', 5),
(2, 'Web Development', 'Full-stack development with React, Node.js, and MongoDB', 'Technology', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop', 'advanced', 6),
(3, 'South Indian Cooking', 'Traditional recipes from Karnataka and Tamil Nadu', 'Cooking', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', 'expert', 12),
(3, 'Yoga & Meditation', 'Hatha Yoga and mindfulness meditation practices', 'Health & Fitness', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', 'advanced', 7),
(4, 'Photography', 'Portrait and landscape photography techniques', 'Creative Arts', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop', 'intermediate', 4),
(4, 'Cricket Coaching', 'Batting and bowling techniques for all age groups', 'Sports', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop', 'advanced', 10),
(5, 'Bengali Language', 'Native Bengali speaker, literature and conversation', 'Languages', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', 'expert', 20),
(5, 'Painting & Sketching', 'Watercolor and pencil sketching techniques', 'Creative Arts', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', 'intermediate', 6),
(6, 'Digital Marketing', 'SEO, social media marketing, and content strategy', 'Business', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', 'advanced', 8),
(6, 'Tabla Playing', 'Classical Indian percussion instrument lessons', 'Music', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop', 'intermediate', 5),
(7, 'Ayurvedic Cooking', 'Healthy cooking based on Ayurvedic principles', 'Health & Wellness', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', 'advanced', 9),
(7, 'Malayalam Language', 'Native Malayalam speaker from Kerala', 'Languages', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop', 'expert', 25),
(8, 'Mobile App Development', 'Android and iOS app development with Flutter', 'Technology', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop', 'intermediate', 3),
(8, 'Badminton Coaching', 'Professional badminton training and techniques', 'Sports', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', 'advanced', 7),
(9, 'Classical Music', 'Carnatic vocal music and music theory', 'Music', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop', 'expert', 15),
(9, 'Data Science', 'Python, machine learning, and data analysis', 'Technology', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'advanced', 5),
(10, 'Stock Market Trading', 'Technical analysis and investment strategies', 'Finance', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop', 'intermediate', 4),
(10, 'Punjabi Language', 'Native Punjabi speaker, cultural context included', 'Languages', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', 'expert', 22);

-- Insert items
INSERT INTO items (user_id, name, description, category, image, condition_rating, is_available) VALUES
(1, 'Bharatanatyam Costume', 'Traditional silk costume with jewelry for classical dance', 'Clothing & Accessories', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', 5, true),
(1, 'Hindi Literature Books', 'Collection of classic Hindi novels by Premchand and others', 'Books', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', 4, true),
(2, 'Yamaha Acoustic Guitar', 'FG800 acoustic guitar in excellent condition', 'Musical Instruments', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop', 5, false),
(2, 'Programming Books Set', 'JavaScript, React, and Node.js reference books', 'Books', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', 4, true),
(3, 'Pressure Cooker', 'Hawkins 5L pressure cooker for Indian cooking', 'Kitchen Appliances', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', 4, true),
(3, 'Yoga Mat & Props', 'Premium yoga mat with blocks and straps', 'Sports & Fitness', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', 5, true),
(4, 'Canon DSLR Camera', 'Canon EOS 1500D with 18-55mm lens', 'Electronics', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop', 4, true),
(4, 'Cricket Kit', 'Complete cricket set with bat, pads, and helmet', 'Sports Equipment', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop', 3, true),
(5, 'Bengali Poetry Books', 'Rabindranath Tagore and other Bengali poets collection', 'Books', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', 5, true),
(5, 'Art Supplies Set', 'Watercolor paints, brushes, and drawing paper', 'Art Supplies', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', 4, true),
(6, 'Marketing Books', 'Digital marketing and SEO strategy books', 'Books', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', 4, true),
(6, 'Tabla Set', 'Professional tabla pair with carrying case', 'Musical Instruments', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop', 5, true),
(7, 'Ayurvedic Spice Kit', 'Collection of authentic Indian spices and herbs', 'Food & Spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop', 5, true),
(7, 'Malayalam Novels', 'Contemporary Malayalam literature collection', 'Books', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', 4, true),
(8, 'Android Tablet', 'Samsung Galaxy Tab for app development testing', 'Electronics', 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop', 4, false),
(8, 'Badminton Racket', 'Yonex professional badminton racket', 'Sports Equipment', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', 5, true),
(9, 'Harmonium', 'Traditional Indian harmonium for music practice', 'Musical Instruments', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop', 4, true),
(9, 'Data Science Books', 'Python and machine learning reference books', 'Books', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', 5, true),
(10, 'Trading Monitor', '24-inch monitor perfect for stock market analysis', 'Electronics', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop', 4, true),
(10, 'Punjabi Books', 'Collection of Punjabi literature and poetry', 'Books', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', 4, true);

-- Insert polls
INSERT INTO polls (user_id, question, poll_type, options, votes) VALUES
(1, 'Which Indian classical dance form should I learn next?', 'text', '["Bharatanatyam", "Kathak", "Odissi", "Kuchipudi"]', '[12, 8, 15, 5]'),
(2, 'Best programming language for beginners?', 'text', '["Python", "JavaScript", "Java", "C++"]', '[25, 18, 12, 8]'),
(3, 'Which South Indian dish should I cook for the festival?', 'image', '[{"text": "Sambar Rice", "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop"}, {"text": "Rasam", "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop"}]', '[22, 18]'),
(4, 'Best camera brand for portrait photography?', 'text', '["Canon", "Nikon", "Sony", "Fujifilm"]', '[15, 12, 20, 8]'),
(5, 'Which art medium should I focus on?', 'text', '["Watercolor", "Oil Painting", "Digital Art", "Sketching"]', '[18, 14, 22, 16]'),
(6, 'Most effective digital marketing channel?', 'text', '["Social Media", "Email Marketing", "SEO", "Paid Ads"]', '[28, 15, 25, 12]'),
(7, 'Best time for yoga practice?', 'text', '["Early Morning", "Evening", "Afternoon", "Night"]', '[35, 18, 8, 4]'),
(8, 'Which mobile platform to develop for first?', 'text', '["Android", "iOS", "Cross-platform", "Web App"]', '[22, 18, 25, 10]'),
(9, 'Best way to learn Carnatic music?', 'text', '["Online Classes", "Traditional Guru", "Self-learning", "Music School"]', '[12, 28, 8, 15]'),
(10, 'Investment strategy for beginners?', 'text', '["Mutual Funds", "Direct Stocks", "Fixed Deposits", "Gold"]', '[25, 15, 18, 12]');

-- Insert barter requests
INSERT INTO barter_requests (from_user_id, to_user_id, type, from_skill_id, to_skill_id, from_item_id, to_item_id, message, status, preferred_date, preferred_time, barter_period) VALUES
(2, 1, 'skill', 3, 1, NULL, NULL, 'Hi Priya! I would love to learn Bharatanatyam. I can teach you guitar in return.', 'pending', '2024-03-20', '18:00', NULL),
(3, 2, 'skill', 5, 4, NULL, NULL, 'Hello Arjun! I am interested in learning web development. I can teach you South Indian cooking.', 'accepted', '2024-03-18', '19:00', NULL),
(4, 3, 'skill', 7, 6, NULL, NULL, 'Hi Kavya! I want to learn yoga and meditation. I can help you with photography skills.', 'ongoing', '2024-03-15', '17:30', NULL),
(1, 4, 'item', NULL, NULL, 2, 8, 'Hi Rohit! Can I borrow your cricket kit for a weekend tournament? I can lend you my Hindi books.', 'pending', NULL, NULL, 7),
(5, 6, 'item', NULL, NULL, 10, 12, 'Hello Vikram! I need a tabla set for practice. You can borrow my art supplies.', 'accepted', NULL, NULL, 14),
(7, 8, 'skill', 13, 15, NULL, NULL, 'Hi Aditya! I would like to learn mobile app development. I can teach you Ayurvedic cooking.', 'declined', '2024-03-22', '20:00', NULL),
(9, 10, 'skill', 17, 19, NULL, NULL, 'Hello Karan! I want to learn about stock market trading. I can teach you Carnatic music.', 'pending', '2024-03-25', '18:30', NULL),
(6, 7, 'item', NULL, NULL, 11, 13, 'Hi Meera! Can I borrow your spice kit for a cooking workshop? You can use my marketing books.', 'ongoing', NULL, NULL, 10),
(8, 9, 'skill', 15, 18, NULL, NULL, 'Hi Shreya! I am interested in learning data science. I can teach you badminton.', 'accepted', '2024-03-19', '17:00', NULL),
(10, 1, 'item', NULL, NULL, 20, 1, 'Hi Priya! I need a dance costume for a cultural event. You can borrow my Punjabi books.', 'pending', NULL, NULL, 5);

-- Insert sessions
INSERT INTO sessions (barter_request_id, scheduled_date, scheduled_time, duration_minutes, status, meeting_link) VALUES
(2, '2024-03-18', '19:00:00', 60, 'scheduled', 'https://meet.google.com/abc-defg-hij'),
(3, '2024-03-15', '17:30:00', 90, 'completed', 'https://meet.google.com/xyz-uvwx-rst'),
(9, '2024-03-19', '17:00:00', 75, 'scheduled', 'https://meet.google.com/pqr-stuv-wxy');

-- Insert notifications
INSERT INTO notifications (user_id, title, message, type, related_id, is_read) VALUES
(1, 'New Skill Request', 'Arjun wants to learn Bharatanatyam from you', 'skill_request', 1, false),
(2, 'Request Accepted', 'Kavya accepted your web development learning request', 'request_accepted', 2, false),
(3, 'Session Reminder', 'Your yoga session with Rohit is tomorrow at 5:30 PM', 'session_reminder', 3, false),
(4, 'Item Request', 'Priya wants to borrow your cricket kit', 'item_request', 4, true),
(5, 'Barter Accepted', 'Vikram accepted your tabla borrowing request', 'barter_accepted', 5, false),
(6, 'Request Declined', 'Aditya declined your app development learning request', 'request_declined', 6, true),
(7, 'New Message', 'You have a new message from Vikram about the spice kit', 'message', 8, false),
(8, 'Session Scheduled', 'Your badminton session with Shreya is confirmed', 'session_scheduled', 9, false),
(9, 'Skill Request', 'Aditya wants to learn data science from you', 'skill_request', 9, true),
(10, 'Item Request', 'Priya wants to borrow your dance costume', 'item_request', 10, false);

-- Insert messages
INSERT INTO messages (barter_request_id, sender_id, message, message_type) VALUES
(2, 3, 'Great! I am excited to learn web development. When can we start?', 'text'),
(2, 2, 'We can start this weekend. I will send you some resources to get started.', 'text'),
(3, 4, 'Thank you for accepting! I have been wanting to learn yoga for stress relief.', 'text'),
(3, 3, 'Perfect! Yoga is great for that. We will start with basic asanas.', 'text'),
(5, 5, 'The tabla set looks perfect for my practice sessions. Thank you!', 'text'),
(5, 6, 'You are welcome! Take good care of it. The art supplies are amazing too.', 'text'),
(8, 6, 'The spice kit has everything I need for the workshop. Much appreciated!', 'text'),
(8, 7, 'Glad it helps! Your marketing books are very insightful.', 'text'),
(9, 8, 'I am really looking forward to learning data science concepts from you.', 'text'),
(9, 9, 'We will cover Python basics first, then move to machine learning.', 'text');

-- Insert reviews
INSERT INTO reviews (barter_request_id, reviewer_id, reviewee_id, rating, comment, review_type) VALUES
(3, 4, 3, 5, 'Kavya is an excellent yoga teacher! Very patient and knowledgeable.', 'skill'),
(3, 3, 4, 4, 'Rohit is a quick learner and very dedicated to photography practice.', 'skill');

-- Insert tracking information
INSERT INTO tracking_info (barter_request_id, tracking_number, carrier, status, estimated_delivery, actual_delivery) VALUES
(5, 'TRK123456789', 'India Post', 'delivered', '2024-03-16', '2024-03-15'),
(8, 'TRK987654321', 'Blue Dart', 'in_transit', '2024-03-20', NULL);