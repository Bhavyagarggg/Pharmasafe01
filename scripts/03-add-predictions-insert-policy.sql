-- Add missing INSERT policy for predictions table
-- Run this in your Supabase SQL Editor if you're getting RLS policy violations

-- Drop policy if it exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can insert their own predictions" ON predictions;

-- Create INSERT policy for predictions table
CREATE POLICY "Users can insert their own predictions"
  ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

