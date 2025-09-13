/*
  # Add RLS policies and index for folder/file management to files table
  1. Security: Enable RLS, add policies for folder/file management
  2. Index: Add index on parent_id for performance
*/

-- Enable Row Level Security (if not already enabled, though it should be)
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
ON files FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy for authenticated users to delete their own files/folders
CREATE OR REPLACE POLICY "Authenticated users can delete their own files and folders"
ON files FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- Create an index on parent_id for faster lookups of files/folders within a parent
CREATE INDEX IF NOT EXISTS idx_files_parent_id ON files (parent_id);
