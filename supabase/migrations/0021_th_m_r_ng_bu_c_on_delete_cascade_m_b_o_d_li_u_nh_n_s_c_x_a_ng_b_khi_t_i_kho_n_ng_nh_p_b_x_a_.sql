-- First, remove any existing foreign key constraint on personnel.id to avoid conflicts
ALTER TABLE public.personnel DROP CONSTRAINT IF EXISTS personnel_id_fkey;

-- Now, add the foreign key constraint with ON DELETE CASCADE
-- This ensures that when an auth.users record is deleted, the corresponding personnel record is also deleted.
ALTER TABLE public.personnel
ADD CONSTRAINT personnel_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id)
ON DELETE CASCADE;