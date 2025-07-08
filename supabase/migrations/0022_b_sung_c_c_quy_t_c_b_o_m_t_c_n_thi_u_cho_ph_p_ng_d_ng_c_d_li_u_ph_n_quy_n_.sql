-- Allow authenticated users to read the main permissions table
CREATE POLICY "Permissions are viewable by authenticated users"
ON public.permissions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to read the join table linking positions to permissions
CREATE POLICY "Position permissions are viewable by authenticated users"
ON public.position_permissions
FOR SELECT
USING (auth.role() = 'authenticated');