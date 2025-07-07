CREATE TABLE personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    position TEXT,
    role TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public personnel are viewable by everyone." ON personnel FOR SELECT USING (true);
CREATE POLICY "Users can insert their own personnel." ON personnel FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own personnel." ON personnel FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own personnel." ON personnel FOR DELETE USING (true);