/*
  # Create files table
  1. New Tables: files (id uuid, user_id uuid, name text, storage_path text, mime_type text, size bigint, created_at timestamp)
  2. Security: Enable RLS, add policies for authenticated users to manage their own files.
*/
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  storage_path text UNIQUE NOT NULL, -- Path in Supabase Storage
  mime_type text,
  size bigint, -- File size in bytes
  created_at timestamptz DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own files
CREATE POLICY "Users can view their own files." ON files
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Policy for users to insert their own files
CREATE POLICY "Users can insert their own files." ON files
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own files (e.g., rename)
CREATE POLICY "Users can update their own files." ON files
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policy for users to delete their own files
CREATE POLICY "Users can delete their own files." ON files
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add index for user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files (user_id);

-- Set up Realtime for files table (optional, but good for future features)
ALTER PUBLICATION supabase_realtime ADD TABLE files;