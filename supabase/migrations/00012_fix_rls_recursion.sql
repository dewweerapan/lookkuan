-- Fix infinite recursion in RLS policies for profiles table
-- The get_user_role() function queries profiles, which triggers RLS policies,
-- which call get_user_role() again → infinite recursion.
-- Fix: Use SECURITY DEFINER so the function runs as the function owner (bypassing RLS)

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;
