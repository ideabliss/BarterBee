-- Update image field size in skills and items tables
-- Run this SQL in your Supabase SQL editor

ALTER TABLE skills ALTER COLUMN image TYPE TEXT;
ALTER TABLE items ALTER COLUMN image TYPE TEXT;