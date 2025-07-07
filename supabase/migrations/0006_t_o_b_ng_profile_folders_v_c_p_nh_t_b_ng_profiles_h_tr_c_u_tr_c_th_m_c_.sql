-- Create the new table for profile folders
CREATE TABLE profile_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profile_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile folders." ON profile_folders FOR ALL USING (true);

-- Add the folder_id column to the existing profiles table
ALTER TABLE profiles
ADD COLUMN folder_id UUID REFERENCES profile_folders(id) ON DELETE SET NULL;