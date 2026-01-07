-- Admin System Setup for ShiftSwap
-- Run this in Supabase SQL Editor

-- 1. Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- 3. Update RLS policies to allow admins to do anything

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can do anything" ON profiles;
DROP POLICY IF EXISTS "Admins can modify any shift" ON shifts;
DROP POLICY IF EXISTS "Admins can delete any shift" ON shifts;
DROP POLICY IF EXISTS "Admins can view all requests" ON swap_requests;
DROP POLICY IF EXISTS "Admins can modify any request" ON swap_requests;

-- Admin policies for profiles
CREATE POLICY "Admins can do anything" ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin policies for shifts
CREATE POLICY "Admins can modify any shift" ON shifts
  FOR ALL
  USING (
    auth.uid() = poster_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin policies for swap_requests
CREATE POLICY "Admins can modify any request" ON swap_requests
  FOR ALL
  USING (
    auth.uid() = proposer_id OR
    EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = swap_requests.shift_id
      AND shifts.poster_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 4. Function to make a user admin (by email)
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE email = user_email;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  IF affected_rows = 0 THEN
    RETURN 'No user found with email: ' || user_email;
  ELSE
    RETURN 'User ' || user_email || ' is now an admin!';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to remove admin privileges
CREATE OR REPLACE FUNCTION remove_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE profiles
  SET is_admin = false
  WHERE email = user_email;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  IF affected_rows = 0 THEN
    RETURN 'No user found with email: ' || user_email;
  ELSE
    RETURN 'Admin privileges removed from ' || user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TO MAKE YOURSELF ADMIN, RUN THIS:
-- Replace 'your@email.com' with the email you used to sign up

-- SELECT make_user_admin('your@email.com');

-- 7. To verify you're an admin:
-- SELECT email, full_name, is_admin FROM profiles WHERE is_admin = true;

-- 8. To see all users:
-- SELECT email, full_name, staff_id, is_admin, created_at FROM profiles ORDER BY created_at DESC;
