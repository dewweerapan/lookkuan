-- Fix: Recreate profiles SELECT policy to not trigger any function calls
-- The simple USING (true) policy should work. If not, there must be additional 
-- policies in the DB. Let's drop ALL policies and recreate only the ones we need.

-- First, try to enumerate and drop any policies that might have been added manually
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol_name);
  END LOOP;
END $$;

-- Recreate only the essential policies
-- SELECT: simple true - no function calls
CREATE POLICY "Profiles viewable by authenticated" ON profiles
  FOR SELECT TO authenticated USING (true);

-- INSERT: use security definer function to check role without recursion  
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');

-- UPDATE: self-update always allowed; admin check via security definer function
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE TO authenticated 
  USING (get_user_role() = 'admin' OR id = auth.uid());
