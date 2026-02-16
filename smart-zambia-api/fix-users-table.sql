-- Fix users table to match backend expectations

-- Check current structure
\d users;

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS cash_earned NUMERIC(12,2) DEFAULT 0;

-- If the table has different column names, let's update them
-- First, let's see what columns exist
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';

-- Update any existing data to have proper values
UPDATE users SET role = 'user' WHERE role IS NULL;
UPDATE users SET cash_earned = 0 WHERE cash_earned IS NULL;

-- Show final structure
\d users;