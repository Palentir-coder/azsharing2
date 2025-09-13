/*
  # Fix storage_path null constraint and RLS policies for files table
  1. Alter Table: files (make storage_path nullable)
  2. Security: Re-create RLS policies using 'user_id' column
  3. Index: Ensure index on parent_id exists
*/

-- 1. Make storage_path column nullable
ALTER TABLE files
ALTER COLUMN storage_path DROP NOT NULL;

-- 2. Re-create RLS policies using the correct 'user_id' column
-- Policy for authenticated users to view their own files and folders
CREATE OR REPLACE POLICY "Authenticated users can view their own files and folders"
ON files FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Policy for authenticated users to create files and folders
CREATE OR REPLACE POLICY "Authenticated users can create files and folders"
ON files FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy for authenticated users to update their own files/folders
CREATE OR REPLACE POLICY "Authenticated users can update their own files and folders"
ON files FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy for authenticated users to delete their own files/folders
CREATE OR REPLACE POLICY "Authenticated users can delete their own files and folders"
ON files FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 3. Ensure index on parent_id exists (safe to run with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_files_parent_id ON files (parent_id);
