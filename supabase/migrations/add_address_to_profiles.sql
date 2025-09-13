/*
  # Add address column to profiles table
  1. New Columns: profiles.address (text)
  2. Security: The existing RLS policy for UPDATE on profiles already covers this.
*/
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address text;