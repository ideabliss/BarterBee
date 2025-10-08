const { supabase } = require('./config/supabase');
const bcrypt = require('bcryptjs');

async function populateDatabase() {
  try {
    console.log('🚀 Starting database population...');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('messages').delete().neq('id', 0);
    await supabase.from('reviews').delete().neq('id', 0);
    await supabase.from('tracking_info').delete().neq('id', 0);
    await supabase.from('sessions').delete().neq('id', 0);
    await supabase.from('notifications').delete().neq('id', 0);
    await supabase.from('barter_requests').delete().neq('id', 0);
    await supabase.from('polls').delete().neq('id', 0);
    await supabase.from('items').delete().neq('id', 0);
    await supabase.from('skills').delete().neq('id', 0);
    await supabase.from('users').delete().neq('id', 0);
    console.log('✅ Existing data cleared');
    
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Insert users
    console.log('👥 Inserting users...');
    const { data: users, error: usersError } = await supabase.from('users').insert([
      { username: 'priya_sharma', email: 'priya.sharma@email.com', password_hash: hashedPassword, name: 'Priya Sharma', contact: '+91-9876543210', address: 'Connaught Place, New Delhi', profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', points: 15 },
      { username: 'arjun_patel', email: 'arjun.patel@email.com', password_hash: hashedPassword, name: 'Arjun Patel', contact: '+91-9876543211', address: 'Bandra West, Mumbai', profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', points: 8 },
      { username: 'kavya_reddy', email: 'kavya.reddy@email.com', password_hash: hashedPassword, name: 'Kavya Reddy', contact: '+91-9876543212', address: 'Koramangala, Bangalore', profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', points: 22 },
      { username: 'rohit_singh', email: 'rohit.singh@email.com', password_hash: hashedPassword, name: 'Rohit Singh', contact: '+91-9876543213', address: 'Sector 17, Chandigarh', profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', points: 12 },
      { username: 'ananya_gupta', email: 'ananya.gupta@email.com', password_hash: hashedPassword, name: 'Ananya Gupta', contact: '+91-9876543214', address: 'Park Street, Kolkata', profile_picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', points: 18 }
    ]).select();
    
    if (usersError) {
      console.error('❌ Error inserting users:', usersError);
      return;
    }
    
    console.log(`✅ Inserted ${users.length} users`);
    
    // Insert skills
    console.log('🎯 Inserting skills...');
    const { data: skills, error: skillsError } = await supabase.from('skills').insert([
      { user_id: users[0].id, name: 'Indian Classical Dance', description: 'Teaching Bharatanatyam and Kathak with 8 years of experience', category: 'Arts & Culture', image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', skill_level: 'advanced', years_experience: 8 },
      { user_id: users[0].id, name: 'Hindi Language', description: 'Native Hindi speaker, can teach conversational and written Hindi', category: 'Languages', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', skill_level: 'expert', years_experience: 15 },
      { user_id: users[1].id, name: 'Guitar Playing', description: 'Acoustic and electric guitar lessons for beginners to intermediate', category: 'Music', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop', skill_level: 'intermediate', years_experience: 5 },
      { user_id: users[1].id, name: 'Web Development', description: 'Full-stack development with React, Node.js, and MongoDB', category: 'Technology', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop', skill_level: 'advanced', years_experience: 6 },
      { user_id: users[2].id, name: 'South Indian Cooking', description: 'Traditional recipes from Karnataka and Tamil Nadu', category: 'Cooking', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', skill_level: 'expert', years_experience: 12 },
      { user_id: users[2].id, name: 'Yoga & Meditation', description: 'Hatha Yoga and mindfulness meditation practices', category: 'Health & Fitness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', skill_level: 'advanced', years_experience: 7 },
      { user_id: users[3].id, name: 'Photography', description: 'Portrait and landscape photography techniques', category: 'Creative Arts', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop', skill_level: 'intermediate', years_experience: 4 },
      { user_id: users[3].id, name: 'Cricket Coaching', description: 'Batting and bowling techniques for all age groups', category: 'Sports', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop', skill_level: 'advanced', years_experience: 10 },
      { user_id: users[4].id, name: 'Bengali Language', description: 'Native Bengali speaker, literature and conversation', category: 'Languages', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', skill_level: 'expert', years_experience: 20 },
      { user_id: users[4].id, name: 'Painting & Sketching', description: 'Watercolor and pencil sketching techniques', category: 'Creative Arts', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', skill_level: 'intermediate', years_experience: 6 }
    ]).select();
    
    if (skillsError) {
      console.error('❌ Error inserting skills:', skillsError);
    } else {
      console.log(`✅ Inserted ${skills?.length || 0} skills`);
    }
    
    // Insert items
    console.log('📦 Inserting items...');
    const { data: items, error: itemsError } = await supabase.from('items').insert([
      { user_id: users[0].id, name: 'Bharatanatyam Costume', description: 'Traditional silk costume with jewelry for classical dance', category: 'Clothing & Accessories', image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', condition_rating: 5, is_available: true },
      { user_id: users[0].id, name: 'Hindi Literature Books', description: 'Collection of classic Hindi novels by Premchand and others', category: 'Books', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', condition_rating: 4, is_available: true },
      { user_id: users[1].id, name: 'Yamaha Acoustic Guitar', description: 'FG800 acoustic guitar in excellent condition', category: 'Musical Instruments', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop', condition_rating: 5, is_available: false },
      { user_id: users[1].id, name: 'Programming Books Set', description: 'JavaScript, React, and Node.js reference books', category: 'Books', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', condition_rating: 4, is_available: true },
      { user_id: users[2].id, name: 'Pressure Cooker', description: 'Hawkins 5L pressure cooker for Indian cooking', category: 'Kitchen Appliances', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', condition_rating: 4, is_available: true },
      { user_id: users[2].id, name: 'Yoga Mat & Props', description: 'Premium yoga mat with blocks and straps', category: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', condition_rating: 5, is_available: true },
      { user_id: users[3].id, name: 'Canon DSLR Camera', description: 'Canon EOS 1500D with 18-55mm lens', category: 'Electronics', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop', condition_rating: 4, is_available: true },
      { user_id: users[3].id, name: 'Cricket Kit', description: 'Complete cricket set with bat, pads, and helmet', category: 'Sports Equipment', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop', condition_rating: 3, is_available: true },
      { user_id: users[4].id, name: 'Bengali Poetry Books', description: 'Rabindranath Tagore and other Bengali poets collection', category: 'Books', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', condition_rating: 5, is_available: true },
      { user_id: users[4].id, name: 'Art Supplies Set', description: 'Watercolor paints, brushes, and drawing paper', category: 'Art Supplies', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', condition_rating: 4, is_available: true }
    ]).select();
    
    if (itemsError) {
      console.error('❌ Error inserting items:', itemsError);
    } else {
      console.log(`✅ Inserted ${items?.length || 0} items`);
    }
    
    // Insert polls
    console.log('🗳️ Inserting polls...');
    const { data: polls, error: pollsError } = await supabase.from('polls').insert([
      { user_id: users[0].id, question: 'Which Indian classical dance form should I learn next?', poll_type: 'text', options: JSON.stringify(['Bharatanatyam', 'Kathak', 'Odissi', 'Kuchipudi']), votes: JSON.stringify([12, 8, 15, 5]) },
      { user_id: users[1].id, question: 'Best programming language for beginners?', poll_type: 'text', options: JSON.stringify(['Python', 'JavaScript', 'Java', 'C++']), votes: JSON.stringify([25, 18, 12, 8]) },
      { user_id: users[2].id, question: 'Which South Indian dish should I cook for the festival?', poll_type: 'image', options: JSON.stringify([{text: 'Sambar Rice', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'}, {text: 'Rasam', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop'}]), votes: JSON.stringify([22, 18]) },
      { user_id: users[3].id, question: 'Best camera brand for portrait photography?', poll_type: 'text', options: JSON.stringify(['Canon', 'Nikon', 'Sony', 'Fujifilm']), votes: JSON.stringify([15, 12, 20, 8]) },
      { user_id: users[4].id, question: 'Which art medium should I focus on?', poll_type: 'text', options: JSON.stringify(['Watercolor', 'Oil Painting', 'Digital Art', 'Sketching']), votes: JSON.stringify([18, 14, 22, 16]) }
    ]).select();
    
    if (pollsError) {
      console.error('❌ Error inserting polls:', pollsError);
    } else {
      console.log(`✅ Inserted ${polls?.length || 0} polls`);
    }
    
    console.log('🎉 Database population completed!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🎯 Skills: ${skills?.length || 0}`);
    console.log(`   📦 Items: ${items?.length || 0}`);
    console.log(`   🗳️ Polls: ${polls?.length || 0}`);
    
  } catch (error) {
    console.error('💥 Error populating database:', error);
  }
}

// Run if called directly
if (require.main === module) {
  populateDatabase().then(() => {
    console.log('✨ Done! You can now login with any of these emails:');
    console.log('   📧 priya.sharma@email.com');
    console.log('   📧 arjun.patel@email.com');
    console.log('   📧 kavya.reddy@email.com');
    console.log('   📧 rohit.singh@email.com');
    console.log('   📧 ananya.gupta@email.com');
    console.log('   🔑 Password for all: password123');
    process.exit(0);
  });
}

module.exports = { populateDatabase };