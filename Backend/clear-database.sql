-- Clear all data from BarterBee database
-- Run this SQL in your Supabase SQL editor

DELETE FROM reviews;
DELETE FROM messages;
DELETE FROM sessions;
DELETE FROM barter_requests;
DELETE FROM notifications;
DELETE FROM polls;
DELETE FROM items;
DELETE FROM skills;
DELETE FROM users;

-- Reset sequences (optional)
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE skills_id_seq RESTART WITH 1;
ALTER SEQUENCE items_id_seq RESTART WITH 1;
ALTER SEQUENCE polls_id_seq RESTART WITH 1;
ALTER SEQUENCE barter_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;