-- Drop the old, more restrictive policies first
DROP POLICY IF EXISTS "Permissions are viewable by authenticated users" ON public.permissions;
DROP POLICY IF EXISTS "Position permissions are viewable by authenticated users" ON public.position_permissions;

-- Create new, more permissive policies that allow public read access
CREATE POLICY "Public permissions are viewable by everyone." ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Public position permissions are viewable by everyone." ON public.position_permissions FOR SELECT USING (true);