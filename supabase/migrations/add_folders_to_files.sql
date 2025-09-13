/*
  # Add folder support to files table
  1. Alter Table: files (add is_folder boolean, add parent_id uuid)
  2. Security: Update RLS policies to account for new columns.
*/
ALTER TABLE files
ADD COLUMN IF NOT EXISTS is_folder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES files(id) ON DELETE CASCADE;

-- Update existing policies to consider folders
-- Policy for users to view their own files and folders
CREATE OR REPLACE POLICY "Users can view their own files and folders." ON files
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Policy for users to insert their own files and folders
CREATE OR REPLACE POLICY "Users can insert their own files and folders." ON files
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own files and folders
CREATE OR REPLACE POLICY "Users can update their own files and folders." ON files
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policy for users to delete their own files and folders
CREATE OR REPLACE POLICY "Users can delete their own files and folders." ON files
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add index for parent_id for faster hierarchical lookups
CREATE INDEX IF NOT EXISTS idx_files_parent_id ON files (parent_id);