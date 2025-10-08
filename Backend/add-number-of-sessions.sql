-- Migration: Add number_of_sessions column to barter_requests table
-- Run this SQL in your Supabase SQL editor if you have existing data

ALTER TABLE barter_requests 
ADD COLUMN IF NOT EXISTS number_of_sessions INTEGER;

-- Optional: Set default value for existing skill barter requests
UPDATE barter_requests 
SET number_of_sessions = 1 
WHERE type = 'skill' AND number_of_sessions IS NULL;