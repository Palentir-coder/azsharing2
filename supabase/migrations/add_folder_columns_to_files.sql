/*
  # Add is_folder and parent_id columns to files table
  1. Alter Table: files (add is_folder boolean, add parent_id uuid REFERENCES files(id))
*/

-- Add is_folder column
ALTER TABLE files
ADD COLUMN IF NOT EXISTS is_folder BOOLEAN DEFAULT FALSE;

-- Add parent_id column with foreign key constraint
ALTER TABLE files
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES files(id) ON DELETE CASCADE;
