CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public positions are viewable by everyone." ON positions FOR SELECT USING (true);
CREATE POLICY "Users can manage positions." ON positions FOR ALL USING (true);