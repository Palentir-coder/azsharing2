/*
  # Add is_folder and parent_id columns to files table, enable RLS, and add policies/index
  1. Alter Table: files (add is_folder boolean, add parent_id uuid REFERENCES files(id))
  2. Security: Enable RLS, add policies for folder/file management
  3. Index: Add index on parent_id for performance
*/

-- Add is_folder column
ALTER TABLE files
ADD COLUMN IF NOT EXISTS is_folder BOOLEAN DEFAULT FALSE;

-- Add parent_id column with foreign key constraint
ALTER TABLE files
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES files(id) ON DELETE CASCADE;

-- Enable Row Level Security (if not already enabled)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own files/folders
CREATE OR REPLACE POLICY "Authenticated users can view their own files and folders"
ON files FOR SELECT TO authenticated
USING (owner_id = auth.uid());

-- Policy for authenticated users to create files/folders
CREATE OR REPLACE POLICY "Authenticated users can create files and folders"
ON files FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Policy for authenticated users to update their own files/folders
CREATE OR REPLACE POLICY "Authenticated users can update their own files and folders"
ON files FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy for authenticated users to delete their own files/folders
CREATE OR REPLACE POLICY "Authenticated users can delete their own files and folders"
ON files FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- Create an index on parent_id for faster lookups of files/folders within a parent
CREATE INDEX IF NOT EXISTS idx_files_parent_id ON files (parent_id);
